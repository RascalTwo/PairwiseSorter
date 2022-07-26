const anchors = document.querySelectorAll('#comparisons-container a');
const options = [
	['ArrowLeft', 'a', 'Left'],
	['ArrowUp', 'w', 'Up'],
	['ArrowRight', 'd', 'Right']
];

document.addEventListener('keydown', (e) => {
	for (const i in options) {
		if (options[i].includes(e.key)) {
			anchors[i].click();
		}
	}
});
