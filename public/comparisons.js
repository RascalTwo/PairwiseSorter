let anchors = document.querySelectorAll('#comparisons-container a');
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


let clicked = false;
function handleClick(e){
	if (clicked) return;
	e.preventDefault();
	clicked = true;
	for (const anchor of anchors) anchor.classList.add('disabled');

	return fetch(this.href).then(response => {
		if (!response.url.endsWith('comparisons')) return window.location = response.url;
		return response.text().then(html => {
			document.querySelector('html').innerHTML = html;
			anchors = document.querySelectorAll('#comparisons-container a');
			anchors.forEach(a => a.addEventListener('click', handleClick));
			runUserJavaScript();
			clicked = false;
		});
	});
}

anchors.forEach(a => a.addEventListener('click', handleClick));