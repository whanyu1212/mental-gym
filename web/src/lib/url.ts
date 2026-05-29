/**
 * Prefix an internal path with Astro's configured base URL so links work both
 * in dev (base "/") and on GitHub Pages (base "/mental-gym").
 *
 * BASE_URL always ends in "/", so we strip any leading "/" from the path before
 * joining to avoid a double slash. Query strings and anchors pass through intact.
 */
export function withBase(path: string): string {
	const base = import.meta.env.BASE_URL;
	return base.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
}

/**
 * Inverse of withBase: remove the base prefix from a pathname so route checks
 * (e.g. active-nav highlighting) work the same in dev ("/problems") and on
 * GitHub Pages ("/mental-gym/problems"). Always returns a leading-slash path.
 */
export function stripBase(pathname: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, "");
	const stripped = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
	return stripped.startsWith("/") ? stripped : "/" + stripped;
}
