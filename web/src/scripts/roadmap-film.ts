export function initRoadmapFilm(root: ParentNode = document): void {
	const dialog = root.querySelector<HTMLDialogElement>("[data-film-dialog]");
	const openButton = root.querySelector<HTMLButtonElement>("[data-film-open]");
	const closeButton = dialog?.querySelector<HTMLButtonElement>("[data-film-close]");
	const video = dialog?.querySelector<HTMLVideoElement>("[data-film-video]");

	if (!dialog || !openButton || !closeButton || !video) return;

	const closeDialog = () => {
		if (dialog.open) dialog.close();
	};

	openButton.addEventListener("click", () => {
		dialog.showModal();
		closeButton.focus();
	});

	closeButton.addEventListener("click", closeDialog);

	dialog.addEventListener("click", (event) => {
		if (event.target === dialog) closeDialog();
	});

	dialog.addEventListener("close", () => {
		video.pause();
		video.currentTime = 0;
		openButton.focus();
	});
}
