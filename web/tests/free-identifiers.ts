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
	const bound = (name: string) => scopes.some((s) => s.has(name));

	const declarePattern = (node: ts.BindingName | undefined, into: Set<string>): void => {
		if (!node) return;
		if (ts.isIdentifier(node)) into.add(node.text);
		else if (ts.isObjectBindingPattern(node) || ts.isArrayBindingPattern(node))
			for (const el of node.elements) if (!ts.isOmittedExpression(el)) declarePattern(el.name, into);
	};

	// Hoist function/var/class/let/const declarations to the start of their block,
	// so a name used before its declaration line still counts as bound.
	const hoist = (statements: readonly ts.Statement[], into: Set<string>): void => {
		for (const st of statements) {
			if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && st.name) into.add(st.name.text);
			else if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) declarePattern(d.name, into);
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

	const visit = (node: ts.Node): void => {
		// Types never run, so identifiers inside them are not reads.
		if (ts.isTypeNode(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) return;

		if (ts.isSourceFile(node) || ts.isBlock(node) || ts.isModuleBlock(node) || ts.isCaseBlock(node)) {
			const names = new Set<string>();
			const statements: readonly ts.Statement[] = ts.isCaseBlock(node) ? node.clauses.flatMap((c) => [...c.statements]) : node.statements;
			hoist(statements, names);
			return withScope(names, () => ts.forEachChild(node, visit));
		}

		if (ts.isFunctionLike(node) && !ts.isTypeNode(node)) {
			const names = new Set<string>();
			if (ts.isFunctionExpression(node) && node.name) names.add(node.name.text);
			const fn = node as ts.SignatureDeclaration & { body?: ts.Node };
			for (const p of fn.parameters ?? []) declarePattern(p.name, names);
			return withScope(names, () => {
				for (const p of fn.parameters ?? []) if (p.initializer) visit(p.initializer);
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
			return withScope(names, () => visit(node.block));
		}

		if (ts.isForStatement(node) || ts.isForOfStatement(node) || ts.isForInStatement(node)) {
			const names = new Set<string>();
			const init = node.initializer;
			if (init && ts.isVariableDeclarationList(init)) for (const d of init.declarations) declarePattern(d.name, names);
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
