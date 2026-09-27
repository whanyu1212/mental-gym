import type { RoadmapPhase, TrackId, WeeklyHours } from "../data/roadmap.ts";
import { HOUR_KINDS } from "../lib/roadmap-hours.ts";
import type { RoadmapPlan } from "../lib/roadmap-plan.ts";

export interface PlanCopy {
	phaseLabels: Record<RoadmapPhase, string>;
	phaseDetails: Record<RoadmapPhase, string>;
	trackTitles: Record<TrackId, string>;
	kindLabels: Record<keyof WeeklyHours, string>;
}

/** The kind of each hour block, in bar order; unused hours are "free". */
export function hourBlocks(hours: WeeklyHours, limit: number): string[] {
	const blocks = HOUR_KINDS.flatMap((kind) => Array<string>(hours[kind]).fill(kind));
	return [...blocks, ...Array<string>(Math.max(0, limit - blocks.length)).fill("free")];
}

export function planSummary(plan: RoadmapPlan, copy: PlanCopy, phaseId: RoadmapPhase, trackId: TrackId): string {
	const phase = plan.phases.find((candidate) => candidate.id === phaseId)!;
	const hours = plan.hours[trackId][phaseId];
	const split = HOUR_KINDS.map((kind) => `${hours[kind]} h ${copy.kindLabels[kind].toLowerCase()}`).join(", ");
	const total = HOUR_KINDS.reduce((sum, kind) => sum + hours[kind], 0);
	const who = phaseId === "foundation" ? "every path" : copy.trackTitles[trackId];
	return `${copy.phaseLabels[phaseId]}, weeks ${phase.firstWeek}–${phase.lastWeek}, ${who}: ${split}. ${total} of ${plan.weeklyLimit} hours.`;
}

export function initRoadmapPlan(root: ParentNode = document): void {
	for (const section of root.querySelectorAll<HTMLElement>("[data-roadmap-plan]")) {
		const plan = JSON.parse(section.dataset.plan ?? "null") as RoadmapPlan | null;
		const copy = JSON.parse(section.dataset.copy ?? "null") as PlanCopy | null;
		const blocks = [...section.querySelectorAll<HTMLElement>("[data-hour-block]")];
		const summary = section.querySelector<HTMLElement>("[data-plan-summary]");
		const detail = section.querySelector<HTMLElement>("[data-plan-detail]");
		if (!plan || !copy || !summary || !detail) continue;

		const selected = <T extends string>(name: string) =>
			section.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value as T | undefined;

		const render = () => {
			const phaseId = selected<RoadmapPhase>("plan-phase") ?? plan.phases[0].id;
			const trackId = selected<TrackId>("plan-track") ?? (Object.keys(plan.hours)[0] as TrackId);
			const kinds = hourBlocks(plan.hours[trackId][phaseId], plan.weeklyLimit);

			blocks.forEach((block, index) => {
				block.dataset.kind = kinds[index] ?? "free";
			});
			for (const kind of HOUR_KINDS) {
				const count = section.querySelector<HTMLElement>(`[data-hours-kind="${kind}"]`);
				if (count) count.textContent = `${plan.hours[trackId][phaseId][kind]} h`;
			}
			section.dataset.phase = phaseId;
			summary.textContent = planSummary(plan, copy, phaseId, trackId);
			detail.textContent = copy.phaseDetails[phaseId];
		};

		section.addEventListener("change", render);
		render();

		// Play the entrance only when JavaScript can also reveal it, and skip it for reduced motion.
		section.dataset.animate = "";
		const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
		if (reducedMotion || typeof IntersectionObserver === "undefined") {
			section.dataset.visible = "";
		} else {
			const observer = new IntersectionObserver((entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					section.dataset.visible = "";
					observer.disconnect();
				}
			}, { threshold: 0.35 });
			observer.observe(section);
		}
	}
}
