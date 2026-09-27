import {
	WEEKLY_HOUR_LIMIT,
	modulesForTrack,
	totalHours,
	type RoadmapPhase,
	type RoadmapTrack,
	type TrackId,
	type WeeklyHours,
} from "../data/roadmap.ts";
import { HOUR_KINDS } from "./roadmap-hours.ts";

export interface PlanPhase {
	id: RoadmapPhase;
	firstWeek: number;
	lastWeek: number;
	weeks: number;
}

export interface RoadmapPlan {
	totalWeeks: number;
	weeklyLimit: number;
	phases: PlanPhase[];
	/** Weekly hours for each track in each phase. */
	hours: Record<TrackId, Record<RoadmapPhase, WeeklyHours>>;
}

/**
 * Summarize the 24-week roadmap for the /roadmap plan diagram: the phase
 * boundaries and each track's weekly hour split per phase, read from the
 * modules themselves so the diagram can't drift from the schedule.
 *
 * Throws if the tracks disagree on phase boundaries or if a track's hours
 * vary within a phase, because one bar per phase could no longer show them.
 */
export function roadmapPlan(tracks: RoadmapTrack[]): RoadmapPlan {
	let phases: PlanPhase[] | undefined;
	const hours = {} as RoadmapPlan["hours"];

	for (const track of tracks) {
		const trackPhases: PlanPhase[] = [];
		const trackHours = {} as Record<RoadmapPhase, WeeklyHours>;

		modulesForTrack(track).forEach((module, index) => {
			const week = index + 1;
			const current = trackPhases.at(-1);
			if (current?.id === module.phase) {
				current.lastWeek = week;
				current.weeks += 1;
			} else {
				trackPhases.push({ id: module.phase, firstWeek: week, lastWeek: week, weeks: 1 });
			}

			const seen = trackHours[module.phase];
			if (!seen) trackHours[module.phase] = module.hours;
			else if (HOUR_KINDS.some((kind) => seen[kind] !== module.hours[kind])) {
				throw new Error(`${track.id} has more than one hour split in its ${module.phase} weeks.`);
			}
			if (totalHours(module.hours) > WEEKLY_HOUR_LIMIT) {
				throw new Error(`${module.id} exceeds the ${WEEKLY_HOUR_LIMIT}-hour weekly limit.`);
			}
		});

		if (phases && JSON.stringify(phases) !== JSON.stringify(trackPhases)) {
			throw new Error(`${track.id} has different phase boundaries from the other tracks.`);
		}
		phases = trackPhases;
		hours[track.id] = trackHours;
	}

	if (!phases) throw new Error("The roadmap has no tracks.");
	return { totalWeeks: phases.at(-1)!.lastWeek, weeklyLimit: WEEKLY_HOUR_LIMIT, phases, hours };
}
