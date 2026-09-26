// Test helper: static scope analysis for a client <script> body.
import ts from "typescript";

/**
 * Names read in `code` that no scope in `code` binds: the identifiers that would
 * throw a ReferenceError if nothing outside provided them. Built on the
 * TypeScript parser so reads such as `draw(maxH)` and bindings such as
 * `maxH => ...` are told apart by syntax, not by guessing from the text.
 */
export function freeIdentifiers(code: string): Set<string> {
	const file = ts.createSourceFile("script.ts", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const free = new Set<string>();

	// Each scope is the set of names declared directly in it.
	const scopes: Set<string>[] = [new Set<string>()];
	const isVar = (list: ts.VariableDeclarationList): boolean =>
		(list.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const | ts.NodeFlags.Using | ts.NodeFlags.AwaitUsing)) === 0;
	const bound = (name: string) => scopes.some((s) => s.has(name));

	const declarePattern = (node: ts.BindingName | undefined, into: Set<string>): void => {
		if (!node) return;
		if (ts.isIdentifier(node)) into.add(node.text);
		else if (ts.isObjectBindingPattern(node) || ts.isArrayBindingPattern(node))
			for (const el of node.elements) if (!ts.isOmittedExpression(el)) declarePattern(el.name, into);
	};

	// Hoist function/class/let/const declarations to the start of their block,
	// so a name used before its declaration line still counts as bound. `var`
	// is function-scoped instead and is collected by functionVars below.
	const hoist = (statements: readonly ts.Statement[], into: Set<string>): void => {
		for (const st of statements) {
			if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && st.name) into.add(st.name.text);
			else if (ts.isVariableStatement(st)) {
				if (!isVar(st.declarationList)) for (const d of st.declarationList.declarations) declarePattern(d.name, into);
			}
			else if (ts.isImportDeclaration(st) && st.importClause) {
				const c = st.importClause;
				if (c.name) into.add(c.name.text);
				const b = c.namedBindings;
				if (b && ts.isNamespaceImport(b)) into.add(b.name.text);
				if (b && ts.isNamedImports(b)) for (const s of b.elements) into.add(s.name.text);
			}
		}
	};

	const withScope = (names: Set<string>, fn: () => void): void => {
		scopes.push(names);
		fn();
		scopes.pop();
	};

	/**
	 * Every `var` name declared anywhere in `root` (in nested blocks, loop
	 * heads, try/catch, switch cases), stopping at inner functions and class
	 * static blocks, which get their own var scope. These all belong to the
	 * enclosing function or script.
	 */
	const functionVars = (root: ts.Node, into: Set<string>): void => {
		const walk = (node: ts.Node): void => {
			if (node !== root && (ts.isFunctionLike(node) || ts.isClassStaticBlockDeclaration(node))) return;
			if (ts.isVariableDeclarationList(node) && isVar(node)) for (const d of node.declarations) declarePattern(d.name, into);
			ts.forEachChild(node, walk);
		};
		walk(root);
	};

	// Is this identifier a read, as opposed to a name that is declared, a
	// property name, an object key, a label, or part of a type?
	const isRead = (id: ts.Identifier): boolean => {
		const p = id.parent;
		if (!p) return true;
		if (ts.isPropertyAccessExpression(p) && p.name === id) return false;
		if (ts.isQualifiedName(p)) return false;
		if ((ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p) || ts.isMethodDeclaration(p) || ts.isGetAccessor(p) || ts.isSetAccessor(p) || ts.isPropertySignature(p) || ts.isMethodSignature(p)) && p.name === id) return false;
		if (ts.isBindingElement(p) && (p.propertyName === id || p.name === id)) return false;
		if ((ts.isVariableDeclaration(p) || ts.isParameter(p) || ts.isFunctionDeclaration(p) || ts.isFunctionExpression(p) || ts.isClassDeclaration(p) || ts.isClassExpression(p)) && p.name === id) return false;
		if (ts.isLabeledStatement(p) || ts.isBreakOrContinueStatement(p)) return false;
		if (ts.isImportSpecifier(p) || ts.isImportClause(p) || ts.isNamespaceImport(p) || ts.isExportSpecifier(p)) return false;
		if (ts.isTypeReferenceNode(p) || ts.isTypeQueryNode(p) || ts.isExpressionWithTypeArguments(p) && ts.isHeritageClause(p.parent) && p.parent.token === ts.SyntaxKind.ImplementsKeyword) return false;
		if (ts.isJsxAttribute(p) && p.name === id) return false;
		return true;
	};

	// Visit the expressions a binding pattern evaluates: element defaults
	// (`{ a = expr }`, `[a = expr]`) and computed keys (`{ [expr]: a }`). The
	// bound names themselves are declarations, handled by declarePattern.
	const visitPattern = (node: ts.BindingName): void => {
		if (ts.isIdentifier(node)) return;
		for (const el of node.elements) {
			if (ts.isOmittedExpression(el)) continue;
			if (el.propertyName && ts.isComputedPropertyName(el.propertyName)) visit(el.propertyName.expression);
			if (el.initializer) visit(el.initializer);
			visitPattern(el.name);
		}
	};

	const visit = (node: ts.Node): void => {
		// `class A extends expr` evaluates expr at runtime. The parser wraps it in
		// an ExpressionWithTypeArguments, which also counts as a type node, so
		// handle it before the type check below. `implements` is types only.
		if (ts.isExpressionWithTypeArguments(node) && ts.isHeritageClause(node.parent)) {
			if (node.parent.token === ts.SyntaxKind.ExtendsKeyword && ts.isClassLike(node.parent.parent)) visit(node.expression);
			return;
		}
		// Types never run, so identifiers inside them are not reads.
		if (ts.isTypeNode(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) return;

		if (ts.isSourceFile(node) || ts.isBlock(node) || ts.isModuleBlock(node) || ts.isCaseBlock(node)) {
			const names = new Set<string>();
			const statements: readonly ts.Statement[] = ts.isCaseBlock(node) ? node.clauses.flatMap((c) => [...c.statements]) : node.statements;
			hoist(statements, names);
			// The script itself is a var scope, and so is a function body, which is
			// the Block directly under a function. Other blocks are not.
			const isVarScope = ts.isSourceFile(node) || (ts.isBlock(node) && (ts.isFunctionLike(node.parent) || ts.isClassStaticBlockDeclaration(node.parent)));
			if (isVarScope) functionVars(node, names);
			return withScope(names, () => ts.forEachChild(node, visit));
		}

		if (ts.isClassStaticBlockDeclaration(node)) return visit(node.body);

		if (ts.isFunctionLike(node) && !ts.isTypeNode(node)) {
			const names = new Set<string>();
			if (ts.isFunctionExpression(node) && node.name) names.add(node.name.text);
			const fn = node as ts.SignatureDeclaration & { body?: ts.Node };
			// A method's computed name (`[expr]() {}`) is evaluated in the
			// enclosing scope, not the method's own.
			if (fn.name && ts.isComputedPropertyName(fn.name)) visit(fn.name.expression);
			for (const p of fn.parameters ?? []) declarePattern(p.name, names);
			return withScope(names, () => {
				for (const p of fn.parameters ?? []) {
					// Defaults and computed keys can sit inside the pattern itself,
					// as in `({ scale = maxH } = {})`, not only in the outer default.
					visitPattern(p.name);
					if (p.initializer) visit(p.initializer);
				}
				if (fn.body) visit(fn.body);
			});
		}

		if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
			const names = new Set<string>();
			if (node.name) names.add(node.name.text);
			return withScope(names, () => ts.forEachChild(node, visit));
		}

		if (ts.isCatchClause(node)) {
			const names = new Set<string>();
			if (node.variableDeclaration) declarePattern(node.variableDeclaration.name, names);
			return withScope(names, () => {
				if (node.variableDeclaration) visitPattern(node.variableDeclaration.name);
				visit(node.block);
			});
		}

		if (ts.isForStatement(node) || ts.isForOfStatement(node) || ts.isForInStatement(node)) {
			const names = new Set<string>();
			const init = node.initializer;
			// `for (let ...)` scopes to the loop; `for (var ...)` was already hoisted
			// to the enclosing function by functionVars.
			if (init && ts.isVariableDeclarationList(init) && !isVar(init)) for (const d of init.declarations) declarePattern(d.name, names);
			return withScope(names, () => ts.forEachChild(node, visit));
		}

		if (ts.isIdentifier(node)) {
			if (isRead(node) && !bound(node.text)) free.add(node.text);
			return;
		}
		if (ts.isShorthandPropertyAssignment(node)) {
			if (!bound(node.name.text)) free.add(node.name.text);
			if (node.objectAssignmentInitializer) visit(node.objectAssignmentInitializer);
			return;
		}
		ts.forEachChild(node, visit);
	};

	visit(file);
	return free;
}

/**
 * Every name a script declares at its top level: `const`/`let`/`var` including
 * multiple declarators and destructuring, plus functions, classes and imports.
 * Used for component frontmatter, whose top-level names exist only at build time.
 */
export function topLevelBindings(code: string): Set<string> {
	const file = ts.createSourceFile("frontmatter.ts", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const names = new Set<string>();
	const addPattern = (node: ts.BindingName): void => {
		if (ts.isIdentifier(node)) names.add(node.text);
		else for (const el of node.elements) if (!ts.isOmittedExpression(el)) addPattern(el.name);
	};
	// A `var` anywhere in the frontmatter (inside if/for/try/switch too) is a
	// top-level binding, because var is scoped to the whole script. Stop at
	// nested functions and class static blocks, which own their vars.
	const collectVars = (node: ts.Node): void => {
		if (node !== file && (ts.isFunctionLike(node) || ts.isClassStaticBlockDeclaration(node))) return;
		if (ts.isVariableDeclarationList(node) && (node.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const | ts.NodeFlags.Using | ts.NodeFlags.AwaitUsing)) === 0) {
			for (const d of node.declarations) addPattern(d.name);
		}
		ts.forEachChild(node, collectVars);
	};
	collectVars(file);
	for (const st of file.statements) {
		if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) addPattern(d.name);
		else if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isEnumDeclaration(st)) && st.name) names.add(st.name.text);
		else if (ts.isImportDeclaration(st) && st.importClause && st.importClause.phaseModifier !== ts.SyntaxKind.TypeKeyword) {
			const c = st.importClause;
			if (c.name) names.add(c.name.text);
			const b = c.namedBindings;
			if (b && ts.isNamespaceImport(b)) names.add(b.name.text);
			if (b && ts.isNamedImports(b)) for (const s of b.elements) if (!s.isTypeOnly) names.add(s.name.text);
		}
	}
	return names;
}
