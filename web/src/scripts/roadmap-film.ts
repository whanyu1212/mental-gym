import {
	FILM_DURATION,
	STAGE_WIDTH,
	buildRoadmapTimeline,
	sceneAt,
	type FilmTimeline,
} from "./roadmap-film-timeline.ts";

export interface FilmClock {
	now(): number;
	/** Call `tick` every `ms` milliseconds until the returned function is called. */
	every(ms: number, tick: () => void): () => void;
}

export interface RoadmapFilmOptions {
	/** Builds the animated timeline. Defaults to lazy-loading GSAP on first open. */
	loadTimeline?: (stage: HTMLElement) => Promise<FilmTimeline>;
	/** Defaults to the `prefers-reduced-motion: reduce` media query. */
	reducedMotion?: () => boolean;
	/** Drives the reduced-motion timeline. */
	clock?: FilmClock;
}

type PlayState = "paused" | "playing" | "ended";

const systemClock: FilmClock = {
	now: () => performance.now(),
	every(ms, tick) {
		const id = setInterval(tick, ms);
		return () => clearInterval(id);
	},
};

async function loadGsapTimeline(stage: HTMLElement): Promise<FilmTimeline> {
	const { gsap } = await import("gsap");
	return buildRoadmapTimeline(gsap, stage);
}

function prefersReducedMotion(): boolean {
	return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * A timeline with no tweens: the playhead advances on a clock and the
 * controller swaps whole scenes. Used for reduced motion, and as the fallback
 * if GSAP fails to load.
 */
export class StaticTimeline implements FilmTimeline {
	private current = 0;
	private origin = 0;
	private stop: (() => void) | null = null;
	private onUpdate: (() => void) | null = null;
	private onComplete: (() => void) | null = null;
	private readonly clock: FilmClock;

	constructor(clock: FilmClock) {
		this.clock = clock;
	}

	play(): void {
		if (this.stop) return;
		this.origin = this.clock.now() - this.current * 1000;
		this.stop = this.clock.every(250, () => {
			this.current = Math.min(FILM_DURATION, (this.clock.now() - this.origin) / 1000);
			this.onUpdate?.();
			if (this.current >= FILM_DURATION) {
				this.pause();
				this.onComplete?.();
			}
		});
	}

	pause(): void {
		this.stop?.();
		this.stop = null;
	}

	seek(time: number): void {
		this.current = Math.min(FILM_DURATION, Math.max(0, time));
		this.origin = this.clock.now() - this.current * 1000;
	}

	time(): number {
		return this.current;
	}

	eventCallback(type: "onUpdate" | "onComplete", callback: (() => void) | null): void {
		if (type === "onUpdate") this.onUpdate = callback;
		else this.onComplete = callback;
	}
}

export function formatFilmTime(seconds: number): string {
	const whole = Math.floor(seconds);
	return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function initRoadmapFilm(root: ParentNode = document, options: RoadmapFilmOptions = {}): void {
	const dialog = root.querySelector<HTMLDialogElement>("[data-film-dialog]");
	const openButton = root.querySelector<HTMLButtonElement>("[data-film-open]");
	const closeButton = dialog?.querySelector<HTMLButtonElement>("[data-film-close]");
	const frame = dialog?.querySelector<HTMLElement>("[data-film-frame]");
	const stage = dialog?.querySelector<HTMLElement>("[data-film-stage]");
	const toggle = dialog?.querySelector<HTMLButtonElement>("[data-film-toggle]");
	const toggleLabel = toggle?.querySelector<HTMLElement>("[data-film-toggle-label]");
	const scrubber = dialog?.querySelector<HTMLInputElement>("[data-film-scrub]");
	const clockText = dialog?.querySelector<HTMLElement>("[data-film-time]");

	if (!dialog || !openButton || !closeButton || !frame || !stage || !toggle || !toggleLabel || !scrubber || !clockText) {
		return;
	}

	const loadTimeline = options.loadTimeline ?? loadGsapTimeline;
	const reducedMotion = options.reducedMotion ?? prefersReducedMotion;
	const clock = options.clock ?? systemClock;
	const scenes = [...stage.querySelectorAll<HTMLElement>("[data-scene]")];

	let timeline: FilmTimeline | null = null;
	let loading: Promise<FilmTimeline> | null = null;
	let state: PlayState = "paused";

	const render = () => {
		const time = timeline?.time() ?? 0;
		const active = sceneAt(time);
		scrubber.value = time.toFixed(1);
		scrubber.setAttribute("aria-valuetext", `${formatFilmTime(time)} of ${formatFilmTime(FILM_DURATION)}`);
		clockText.textContent = `${formatFilmTime(time)} / ${formatFilmTime(FILM_DURATION)}`;
		scenes.forEach((scene, index) => scene.toggleAttribute("data-active", index === active));
	};

	const setState = (next: PlayState) => {
		state = next;
		toggle.dataset.state = next;
		toggleLabel.textContent = next === "playing" ? "Pause" : next === "ended" ? "Replay" : "Play";
	};

	const ensureTimeline = () => {
		loading ??= (
			reducedMotion()
				? Promise.resolve<FilmTimeline>(new StaticTimeline(clock))
				: loadTimeline(stage).catch(() => new StaticTimeline(clock))
		).then((built) => {
			timeline = built;
			built.eventCallback("onUpdate", render);
			built.eventCallback("onComplete", () => {
				setState("ended");
				render();
			});
			stage.dataset.ready = "";
			scrubber.disabled = false;
			render();
			return built;
		});
		return loading;
	};

	const play = async () => {
		const built = await ensureTimeline();
		if (!dialog.open) return;
		if (state === "ended") built.seek(0);
		built.play();
		setState("playing");
		render();
	};

	const pause = () => {
		timeline?.pause();
		setState("paused");
		render();
	};

	const updateScale = () => {
		frame.style.setProperty("--film-scale", String(frame.clientWidth / STAGE_WIDTH));
	};

	if (typeof ResizeObserver !== "undefined") {
		new ResizeObserver(updateScale).observe(frame);
	}

	const closeDialog = () => {
		if (dialog.open) dialog.close();
	};

	openButton.addEventListener("click", () => {
		dialog.showModal();
		closeButton.focus();
		updateScale();
		void play();
	});

	closeButton.addEventListener("click", closeDialog);

	dialog.addEventListener("click", (event) => {
		if (event.target === dialog) closeDialog();
	});

	toggle.addEventListener("click", () => {
		if (state === "playing") pause();
		else void play();
	});

	scrubber.addEventListener("input", () => {
		if (!timeline) return;
		const time = Number(scrubber.value);
		timeline.seek(time);
		if (time >= FILM_DURATION) {
			// Seeking suppresses onComplete, so finish explicitly.
			timeline.pause();
			setState("ended");
		} else if (state === "ended") {
			setState("paused");
		}
		render();
	});

	dialog.addEventListener("close", () => {
		timeline?.pause();
		timeline?.seek(0);
		setState("paused");
		render();
		openButton.focus();
	});
}
