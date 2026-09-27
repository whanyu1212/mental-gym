import type { gsap as GSAP } from "gsap";

/** The film is six 4-second scenes laid out on a fixed 1920×1080 stage. */
export const FILM_DURATION = 24;
export const SCENE_LENGTH = 4;
export const SCENE_COUNT = 6;
export const STAGE_WIDTH = 1920;

/** Index of the scene on screen at `time` seconds. */
export function sceneAt(time: number): number {
	return Math.min(SCENE_COUNT - 1, Math.max(0, Math.floor(time / SCENE_LENGTH)));
}

/**
 * The slice of a GSAP timeline the film controller drives. The reduced-motion
 * fallback implements the same surface without tweening anything.
 */
export interface FilmTimeline {
	play(): unknown;
	pause(): unknown;
	seek(time: number): unknown;
	time(): number;
	eventCallback(type: "onUpdate" | "onComplete", callback: (() => void) | null): unknown;
}

/**
 * Build the paused 24-second timeline for a `RoadmapFilmStage`.
 *
 * Tweens are ported from media/hyperframes/mental-gym-intro/index.html, with
 * every selector scoped to `stage`. Scene visibility is not tweened here: the
 * controller toggles `data-active` from the playhead, so scrubbing in either
 * direction always shows exactly one scene.
 */
export function buildRoadmapTimeline(gsap: typeof GSAP, stage: HTMLElement): FilmTimeline {
	const q = gsap.utils.selector(stage);
	const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

	tl.from(q(".hook-ring"), { scale: 0.9, opacity: 0, duration: 1.1 }, 0.15)
		.from(q(".hook-badge"), { y: 18, opacity: 0, stagger: 0.18, duration: 0.65 }, 0.65)
		.to(q(".hook-ring"), { rotation: 8, duration: 3.6, ease: "none" }, 0.2);

	tl.from(q('[data-scene="loop"] .scene-copy > *'), { x: -34, opacity: 0, stagger: 0.14, duration: 0.7 }, 4.05)
		.from(q(".loop-track, .loop-center"), { scale: 0.86, opacity: 0, stagger: 0.14, duration: 0.8 }, 4.05)
		.from(q(".loop-node"), { scale: 0.65, opacity: 0, stagger: 0.22, duration: 0.55 }, 4.45)
		.to(q(".orbit-spinner"), { rotation: 360, duration: 3.6, ease: "none" }, 4.2);

	tl.from(q('[data-scene="paths"] .scene-copy > *'), { y: 28, opacity: 0, stagger: 0.14, duration: 0.65 }, 8.05)
		.from(q(".path-card"), { y: 46, opacity: 0, stagger: 0.16, duration: 0.72 }, 8.55);

	tl.from(q('[data-scene="plan"] .scene-copy > *'), { x: -34, opacity: 0, stagger: 0.14, duration: 0.65 }, 12.05)
		.from(q(".plan-bar"), { y: 28, opacity: 0, duration: 0.65 }, 12.25)
		.from(q(".timeline i"), { scaleX: 0, transformOrigin: "left center", stagger: 0.14, duration: 0.55 }, 12.6)
		.from(q(".hour"), { y: 24, opacity: 0, stagger: 0.12, duration: 0.5 }, 13.0)
		.from(q(".budget-note"), { x: 28, opacity: 0, duration: 0.6 }, 13.4);

	tl.from(q('[data-scene="proof"] .scene-copy > *'), { x: -34, opacity: 0, stagger: 0.14, duration: 0.65 }, 16.05)
		.from(q(".proof-card"), { scale: 0.94, opacity: 0, stagger: 0.16, duration: 0.62 }, 16.35)
		.from(q(".proof-arrow"), { scale: 0, rotation: -90, duration: 0.6, ease: "back.out(1.7)" }, 17.05);

	tl.from(q('[data-scene="cta"] .eyebrow'), { y: 20, opacity: 0, duration: 0.6 }, 20.05)
		.from(q('[data-scene="cta"] .display'), { y: 34, opacity: 0, duration: 0.75 }, 20.2)
		.from(q(".cta-rule"), { scaleX: 0, duration: 0.55 }, 20.75)
		.from(q('[data-scene="cta"] .lead'), { y: 24, opacity: 0, duration: 0.6 }, 21.0)
		.from(q(".cta-link"), { y: 20, opacity: 0, scale: 0.96, duration: 0.6 }, 21.35);

	// The last tween ends near 22 s; hold the closing frame until the full 24 s.
	tl.set({}, {}, FILM_DURATION);

	return tl;
}
