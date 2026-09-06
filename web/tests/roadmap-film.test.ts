import assert from "node:assert/strict";
import { statSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

import { initRoadmapFilm } from "../src/scripts/roadmap-film.ts";

const publicMedia = new URL("../public/media/", import.meta.url);

function setup() {
	const dom = new JSDOM(`
		<button data-film-open>Open</button>
		<dialog data-film-dialog>
			<button data-film-close>Close</button>
			<video data-film-video></video>
		</dialog>
	`);
	const { document, Event } = dom.window;
	const dialog = document.querySelector<HTMLDialogElement>("[data-film-dialog]")!;
	const openButton = document.querySelector<HTMLButtonElement>("[data-film-open]")!;
	const closeButton = document.querySelector<HTMLButtonElement>("[data-film-close]")!;
	const video = document.querySelector<HTMLVideoElement>("[data-film-video]")!;
	let pauseCalls = 0;

	dialog.showModal = () => {
		dialog.open = true;
	};
	dialog.close = () => {
		dialog.open = false;
		dialog.dispatchEvent(new Event("close"));
	};
	video.pause = () => {
		pauseCalls += 1;
	};

	initRoadmapFilm(document);

	return { dialog, openButton, closeButton, video, pauseCalls: () => pauseCalls };
}

test("the published roadmap film and poster are present", () => {
	assert.ok(statSync(new URL("mental-gym-intro.mp4", publicMedia)).size > 0);
	assert.ok(statSync(new URL("mental-gym-intro-poster.png", publicMedia)).size > 0);
});

test("the roadmap film opens and moves focus to its close button", () => {
	const { dialog, openButton, closeButton } = setup();

	openButton.click();

	assert.equal(dialog.open, true);
	assert.equal(dialog.ownerDocument.activeElement, closeButton);
});

test("closing the roadmap film pauses and resets playback", () => {
	const { dialog, openButton, closeButton, video, pauseCalls } = setup();
	openButton.click();
	video.currentTime = 8;

	closeButton.click();

	assert.equal(dialog.open, false);
	assert.equal(video.currentTime, 0);
	assert.equal(pauseCalls(), 1);
	assert.equal(dialog.ownerDocument.activeElement, openButton);
});

test("clicking the dialog backdrop closes the roadmap film", () => {
	const { dialog, openButton } = setup();
	openButton.click();

	dialog.click();

	assert.equal(dialog.open, false);
});
