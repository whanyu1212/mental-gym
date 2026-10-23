/** Representative growth functions, not measured algorithm runtimes. */
export const CHART_INPUTS = [2, 3, 4, 6, 8, 10, 12, 16, 24, 32, 64, 128, 256, 512, 1024];
export const CHART_MAX = 1_000_000_000;

/** Equally spaced powers of two, with fewer labels on narrow canvases. */
export function chartInputTicks(width: number): number[] {
	return width < 600
		? [2, 16, 128, 1024]
		: [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
}

export function factorial(n: number): number {
	let result = 1;
	for (let i = 2; i <= n; i++) {
		result *= i;
		if (!Number.isFinite(result)) return Infinity;
	}
	return result;
}

export const COMPLEXITY_CURVES = [
	{ id: "constant", label: "O(1)", name: "Constant", dash: [], growth: (_n: number) => 1 },
	{ id: "log", label: "O(log n)", name: "Logarithmic", dash: [6, 3], growth: (n: number) => Math.log2(n) },
	{ id: "sqrt", label: "O(√n)", name: "Square root", dash: [2, 3], growth: (n: number) => Math.sqrt(n) },
	{ id: "linear", label: "O(n)", name: "Linear", dash: [], growth: (n: number) => n },
	{ id: "linearithmic", label: "O(n log n)", name: "Linearithmic", dash: [6, 3], growth: (n: number) => n * Math.log2(n) },
	{ id: "quadratic", label: "O(n²)", name: "Quadratic", dash: [2, 3], growth: (n: number) => n ** 2 },
	{ id: "cubic", label: "O(n³)", name: "Cubic", dash: [], growth: (n: number) => n ** 3 },
	{ id: "exponential", label: "O(2ⁿ)", name: "Exponential", dash: [6, 3], growth: (n: number) => 2 ** n },
	{ id: "factorial", label: "O(n!)", name: "Factorial", dash: [2, 3], growth: factorial },
];

/** Omit out-of-range points rather than falsely flattening the curve. */
export function chartValue(value: number): number | null {
	return Number.isFinite(value) && value > 0 && value <= CHART_MAX ? value : null;
}

export function formatGrowthValue(value: number): string {
	if (!Number.isFinite(value) || value > CHART_MAX) return "> 1 billion";
	return new Intl.NumberFormat("en", { maximumFractionDigits: 2, maximumSignificantDigits: 3 }).format(value);
}
