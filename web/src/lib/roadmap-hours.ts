import type { WeeklyHours } from "../data/roadmap.ts";

/** Weekly hour categories in display order. Kept free of roadmap data so client scripts can import it. */
export const HOUR_KINDS = ["study", "implementation", "interview", "language"] as const satisfies readonly (keyof WeeklyHours)[];
