import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

import { WEEKLY_HOUR_LIMIT, tracks, type RoadmapTrack } from "../src/data/roadmap.ts";
import { roadmapPlan } from "../src/lib/roadmap-plan.ts";
import { hourBlocks, initRoadmapPlan, planSummary, type PlanCopy } from "../src/scripts/roadmap-plan.ts";

const plan = roadmapPlan(tracks);
const copy: PlanCopy = {
	phaseLabels: { foundation: "Foundation", specialization: "Specialization", capstone: "Capstone" },
	phaseDetails: { foundation: "Shared.", specialization: "Role-specific.", capstone: "Ship it." },
	trackTitles: Object.fromEntries(tracks.map((track) => [track.id, track.title])) as PlanCopy["trackTitles"],
	kindLabels: { study: "Study", implementation: "Implementation", interview: "Interview practice", language: "Language practice" },
};

test("the plan reads phase boundaries from the roadmap modules", () => {
	assert.equal(plan.totalWeeks, 24);
	assert.equal(plan.weeklyLimit, WEEKLY_HOUR_LIMIT);
	assert.deepEqual(
		plan.phases.map(({ id, firstWeek, lastWeek, weeks }) => [id, firstWeek, lastWeek, weeks]),
		[
			["foundation", 1, 8, 8],
			["specialization", 9, 20, 12],
			["capstone", 21, 24, 4],
		],
	);
});

test("the plan reads each track's hour split per phase", () => {
	assert.deepEqual(plan.hours["applied-ai"].foundation, { study: 5, implementation: 5, interview: 3, language: 2 });
	assert.deepEqual(plan.hours["ml-infrastructure"].specialization, { study: 5, implementation: 7, interview: 3, language: 0 });
	assert.deepEqual(plan.hours["ai-product"].specialization, plan.hours["ai-product"].foundation);
	for (const track of tracks) {
		assert.deepEqual(plan.hours[track.id].capstone, { study: 3, implementation: 9, interview: 3, language: 0 });
	}
});

test("the plan refuses a schedule that one bar per phase can't show", () => {
	const [first, second] = tracks;
	const shortened: RoadmapTrack = { ...second, capstoneIds: second.capstoneIds.slice(1) };
	assert.throws(() => roadmapPlan([first, shortened]), /different phase boundaries/);
});

test("hour blocks fill the weekly budget in category order", () => {
	assert.deepEqual(hourBlocks({ study: 2, implementation: 1, interview: 1, language: 0 }, 6), [
		"study",
		"study",
		"implementation",
		"interview",
		"free",
		"free",
	]);
	assert.equal(hourBlocks(plan.hours["model-post-training"].capstone, WEEKLY_HOUR_LIMIT).length, WEEKLY_HOUR_LIMIT);
});

test("the summary names the phase, weeks, path, and split", () => {
	assert.equal(
		planSummary(plan, copy, "specialization", "ml-infrastructure"),
		"Specialization, weeks 9–20, ML Infrastructure: 5 h study, 7 h implementation, 3 h interview practice, 0 h language practice. 15 of 15 hours.",
	);
	assert.match(planSummary(plan, copy, "foundation", "ai-product"), /^Foundation, weeks 1–8, every path:/);
});

test("the component renders the default view on the server", () => {
	const component = readFileSync(new URL("../src/components/roadmap/RoadmapPlan.astro", import.meta.url), "utf8");
	assert.match(component, /data-plan-summary>\{planSummary\(plan, copy, firstPhase, firstTrack\)\}/);
	assert.match(component, /aria-live="polite"/);
	const page = readFileSync(new URL("../src/pages/roadmap/index.astro", import.meta.url), "utf8");
	assert.match(page, /<RoadmapPlan \/>/);
	assert.doesNotMatch(page, /class="phases"|class="principles"/);
});

test("choosing a phase and a path redraws the hour bar and the summary", () => {
	const dom = new JSDOM(`
		<section data-roadmap-plan data-plan='${JSON.stringify(plan)}' data-copy='${JSON.stringify(copy)}'>
			${plan.phases.map((phase, index) => `<input type="radio" name="plan-phase" value="${phase.id}"${index === 0 ? " checked" : ""} />`).join("")}
			${tracks.map((track, index) => `<input type="radio" name="plan-track" value="${track.id}"${index === 0 ? " checked" : ""} />`).join("")}
			${Array.from({ length: WEEKLY_HOUR_LIMIT }, () => "<span data-hour-block></span>").join("")}
			<strong data-hours-kind="implementation"></strong>
			<strong data-hours-kind="language"></strong>
			<p data-plan-summary></p>
			<p data-plan-detail></p>
		</section>
	`);
	const { document, Event } = dom.window;
	const section = document.querySelector<HTMLElement>("[data-roadmap-plan]")!;
	const pick = (name: string, value: string) => {
		const input = document.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`)!;
		input.checked = true;
		input.dispatchEvent(new Event("change", { bubbles: true }));
	};
	const kinds = () => [...document.querySelectorAll<HTMLElement>("[data-hour-block]")].map((block) => block.dataset.kind);

	initRoadmapPlan(document);
	assert.equal(section.dataset.phase, "foundation");
	assert.equal(kinds().filter((kind) => kind === "language").length, 2);
	assert.ok(section.hasAttribute("data-visible"), "no IntersectionObserver in jsdom, so the entrance is skipped");

	pick("plan-phase", "specialization");
	pick("plan-track", "ml-infrastructure");

	assert.equal(section.dataset.phase, "specialization");
	assert.equal(kinds().filter((kind) => kind === "implementation").length, 7);
	assert.equal(kinds().filter((kind) => kind === "language").length, 0);
	assert.equal(document.querySelector("[data-hours-kind='implementation']")!.textContent, "7 h");
	assert.match(document.querySelector("[data-plan-summary]")!.textContent!, /ML Infrastructure: 5 h study, 7 h implementation/);
	assert.equal(document.querySelector("[data-plan-detail]")!.textContent, "Role-specific.");

	pick("plan-phase", "capstone");
	assert.equal(kinds().filter((kind) => kind === "implementation").length, 9);
});
