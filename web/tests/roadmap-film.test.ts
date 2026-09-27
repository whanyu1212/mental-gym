import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

import { StaticTimeline, formatFilmTime, initRoadmapFilm, type FilmClock } from "../src/scripts/roadmap-film.ts";
import {
	FILM_DURATION,
	SCENE_COUNT,
	buildRoadmapTimeline,
	sceneAt,
	type FilmTimeline,
} from "../src/scripts/roadmap-film-timeline.ts";

const component = readFileSync(new URL("../src/components/RoadmapFilm.astro", import.meta.url), "utf8");
const stageComponent = readFileSync(new URL("../src/components/RoadmapFilmStage.astro", import.meta.url), "utf8");
const SCENES = ["hook", "loop", "paths", "plan", "proof", "cta"];

/** Records calls and lets a test move the playhead or finish the film by hand. */
class FakeTimeline implements FilmTimeline {
	calls: string[] = [];
	current = 0;
	callbacks: Partial<Record<"onUpdate" | "onComplete", () => void>> = {};

	play() {
		this.calls.push("play");
	}
	pause() {
		this.calls.push("pause");
	}
	seek(time: number) {
		this.calls.push(`seek:${time}`);
		this.current = time;
	}
	time() {
		return this.current;
	}
	eventCallback(type: "onUpdate" | "onComplete", callback: (() => void) | null) {
		if (callback) this.callbacks[type] = callback;
	}
	advanceTo(time: number) {
		this.current = time;
		this.callbacks.onUpdate?.();
		if (time >= FILM_DURATION) this.callbacks.onComplete?.();
	}
}

class ManualClock implements FilmClock {
	ms = 0;
	private ticks = new Set<() => void>();

	now() {
		return this.ms;
	}
	every(_ms: number, tick: () => void) {
		this.ticks.add(tick);
		return () => this.ticks.delete(tick);
	}
	advance(seconds: number) {
		this.ms += seconds * 1000;
		for (const tick of [...this.ticks]) tick();
	}
}

function setup(options: { reducedMotion?: boolean; loadFails?: boolean } = {}) {
	const dom = new JSDOM(`
		<button data-film-open>Open</button>
		<dialog data-film-dialog>
			<button data-film-close>Close</button>
			<div data-film-frame>
				<div data-film-stage>
					${SCENES.map((name, index) => `<section data-scene="${name}"${index === 0 ? " data-active" : ""}></section>`).join("")}
				</div>
			</div>
			<button data-film-toggle><span data-film-toggle-label>Play</span></button>
			<input type="range" min="0" max="24" step="0.1" value="0" disabled data-film-scrub />
			<span data-film-time></span>
		</dialog>
	`);
	const { document, Event } = dom.window;
	const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
	const dialog = $<HTMLDialogElement>("[data-film-dialog]");
	const fake = new FakeTimeline();
	const clock = new ManualClock();
	let loads = 0;

	dialog.showModal = () => {
		dialog.open = true;
	};
	dialog.close = () => {
		dialog.open = false;
		dialog.dispatchEvent(new Event("close"));
	};

	initRoadmapFilm(document, {
		loadTimeline: async () => {
			loads += 1;
			if (options.loadFails) throw new Error("chunk failed to load");
			return fake;
		},
		reducedMotion: () => options.reducedMotion ?? false,
		clock,
	});

	const scrub = (value: number) => {
		const scrubber = $<HTMLInputElement>("[data-film-scrub]");
		scrubber.value = String(value);
		scrubber.dispatchEvent(new Event("input"));
	};

	return {
		document,
		dialog,
		fake,
		clock,
		loads: () => loads,
		scrub,
		openButton: $<HTMLButtonElement>("[data-film-open]"),
		closeButton: $<HTMLButtonElement>("[data-film-close]"),
		toggle: $<HTMLButtonElement>("[data-film-toggle]"),
		scrubber: $<HTMLInputElement>("[data-film-scrub]"),
		time: $<HTMLElement>("[data-film-time]"),
		stage: $<HTMLElement>("[data-film-stage]"),
		activeScene: () => $<HTMLElement>("[data-scene][data-active]").dataset.scene,
	};
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

test("the film is a live stage, not a video file", () => {
	assert.doesNotMatch(component, /<video|\.mp4|poster=/);
	assert.match(component, /<RoadmapFilmStage \/>/);
	assert.ok(!existsSync(new URL("../public/media/mental-gym-intro.mp4", import.meta.url)));
	assert.match(stageComponent, /data-film-stage aria-hidden="true"/);
	for (const name of SCENES) assert.match(stageComponent, new RegExp(`data-scene="${name}"`));
});

test("the animated film has a programmatically associated scene transcript", () => {
	assert.match(component, /aria-describedby="film-description"/);
	assert.match(component, /id="film-transcript"/);
	for (const content of [
		"Learn, Implement, Practice, Review, and Retain",
		"Applied AI / Agents",
		"eight foundation weeks",
		"Infrastructure and model specialization weeks move the two language hours to implementation",
		"capstone weeks allocate three hours to study, nine to implementation",
		"Every variation keeps the total at 15 hours",
		"versioned implementations",
		"Open the AI engineering roadmap",
	]) {
		assert.ok(component.includes(content), `transcript is missing: ${content}`);
	}
});

test("opening the film moves focus to close, loads the timeline once, and plays", async () => {
	const { dialog, openButton, closeButton, toggle, scrubber, stage, fake, loads } = setup();

	openButton.click();
	await settle();

	assert.equal(dialog.open, true);
	assert.equal(dialog.ownerDocument.activeElement, closeButton);
	assert.deepEqual(fake.calls, ["play"]);
	assert.equal(toggle.textContent?.trim(), "Pause");
	assert.equal(scrubber.disabled, false);
	assert.ok(stage.hasAttribute("data-ready"));

	dialog.close();
	openButton.click();
	await settle();
	assert.equal(loads(), 1);
});

test("the toggle pauses and resumes playback", async () => {
	const { openButton, toggle, fake } = setup();
	openButton.click();
	await settle();

	toggle.click();
	assert.equal(toggle.textContent?.trim(), "Play");
	assert.equal(toggle.dataset.state, "paused");

	toggle.click();
	await settle();
	assert.equal(toggle.textContent?.trim(), "Pause");
	assert.deepEqual(fake.calls, ["play", "pause", "play"]);
});

test("the playhead drives the scrubber, the clock, and the visible scene", async () => {
	const { openButton, fake, scrubber, time, activeScene } = setup();
	openButton.click();
	await settle();

	fake.advanceTo(9.2);

	assert.equal(scrubber.value, "9.2");
	assert.equal(scrubber.getAttribute("aria-valuetext"), "0:09 of 0:24");
	assert.equal(time.textContent, "0:09 / 0:24");
	assert.equal(activeScene(), "paths");
});

test("scrubbing seeks the timeline and shows that scene", async () => {
	const { openButton, fake, scrub, activeScene } = setup();
	openButton.click();
	await settle();

	scrub(17.5);

	assert.ok(fake.calls.includes("seek:17.5"));
	assert.equal(activeScene(), "proof");
});

test("the end of the film offers a replay from the start", async () => {
	const { openButton, toggle, fake } = setup();
	openButton.click();
	await settle();

	fake.advanceTo(FILM_DURATION);
	assert.equal(toggle.textContent?.trim(), "Replay");

	toggle.click();
	await settle();
	assert.deepEqual(fake.calls.slice(-2), ["seek:0", "play"]);
	assert.equal(toggle.textContent?.trim(), "Pause");
});

test("scrubbing to the end finishes the film", async () => {
	const { openButton, toggle, fake, scrub } = setup();
	openButton.click();
	await settle();

	scrub(FILM_DURATION);

	assert.equal(fake.calls.at(-1), "pause");
	assert.equal(toggle.textContent?.trim(), "Replay");
});

test("closing the film pauses, rewinds, and returns focus", async () => {
	const { dialog, openButton, closeButton, fake, activeScene } = setup();
	openButton.click();
	await settle();
	fake.advanceTo(8);

	closeButton.click();

	assert.equal(dialog.open, false);
	assert.deepEqual(fake.calls.slice(-2), ["pause", "seek:0"]);
	assert.equal(activeScene(), "hook");
	assert.equal(dialog.ownerDocument.activeElement, openButton);
});

test("closing before the timeline loads doesn't start playback", async () => {
	const { dialog, openButton, fake } = setup();

	openButton.click();
	dialog.close();
	await settle();

	assert.deepEqual(fake.calls, []);
});

test("clicking the dialog backdrop closes the film", () => {
	const { dialog, openButton } = setup();
	openButton.click();

	dialog.click();

	assert.equal(dialog.open, false);
});

test("reduced motion skips GSAP and steps through whole scenes", async () => {
	const { openButton, clock, loads, activeScene, toggle } = setup({ reducedMotion: true });
	openButton.click();
	await settle();

	assert.equal(loads(), 0);
	assert.equal(activeScene(), "hook");
	clock.advance(4.5);
	assert.equal(activeScene(), "loop");
	clock.advance(FILM_DURATION);
	assert.equal(activeScene(), "cta");
	assert.equal(toggle.textContent?.trim(), "Replay");
});

test("if GSAP fails to load, the film still plays as static scenes", async () => {
	const { openButton, clock, activeScene, toggle } = setup({ loadFails: true });
	openButton.click();
	await settle();

	assert.equal(toggle.textContent?.trim(), "Pause");
	clock.advance(12.1);
	assert.equal(activeScene(), "plan");
});

test("the static timeline keeps time across pause and seek", () => {
	const clock = new ManualClock();
	const timeline = new StaticTimeline(clock);

	timeline.play();
	clock.advance(3);
	timeline.pause();
	clock.advance(10);
	assert.equal(timeline.time(), 3);

	timeline.seek(20);
	timeline.play();
	clock.advance(2);
	assert.equal(timeline.time(), 22);
});

test("scene and time helpers", () => {
	assert.deepEqual([0, 3.99, 4, 23.9, 24, 30].map(sceneAt), [0, 0, 1, 5, 5, 5]);
	assert.equal(SCENE_COUNT, SCENES.length);
	assert.equal(formatFilmTime(0), "0:00");
	assert.equal(formatFilmTime(9.7), "0:09");
	assert.equal(formatFilmTime(24), "0:24");
});

test("the real GSAP timeline lasts 24 seconds and animates each scene", async () => {
	// Render the stage's actual markup so the timeline's selectors are checked against it.
	const markup = stageComponent.slice(stageComponent.indexOf("<div class=\"film-frame\""), stageComponent.indexOf("<style>"));
	const dom = new JSDOM(markup, { pretendToBeVisual: true });
	Object.assign(globalThis, {
		window: dom.window,
		document: dom.window.document,
		getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
	});
	const { gsap } = await import("gsap");
	const stage = dom.window.document.querySelector<HTMLElement>("[data-film-stage]")!;
	const timeline = buildRoadmapTimeline(gsap, stage) as ReturnType<typeof gsap.timeline>;
	const style = (selector: string) => stage.querySelector<HTMLElement>(selector)!.style;

	assert.equal(timeline.duration(), FILM_DURATION);

	timeline.seek(8.1);
	assert.ok(Number(style(".path-card").opacity) < 0.5, "path cards start hidden");
	timeline.seek(11.9);
	assert.equal(style(".path-card").opacity, "1");

	timeline.seek(12.7);
	assert.match(style(".timeline i").transform, /scale\(0\.\d+, 1\)|scaleX\(0\.\d+\)|matrix/);

	timeline.seek(23.9);
	assert.equal(style(".cta-link").opacity, "1");

	// Every tween target exists in the markup: GSAP warns about missing targets instead of throwing.
	for (const child of timeline.getChildren(true, true, false)) {
		const targets = (child as ReturnType<typeof gsap.to>).targets();
		if (targets.length && !(targets[0] instanceof dom.window.HTMLElement)) continue;
		assert.ok(targets.length > 0, "a tween has no targets");
	}
});
