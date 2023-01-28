let anchors = document.querySelectorAll('#comparisons-container a.compare-item');
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
			anchors = document.querySelectorAll('#comparisons-container a.compare-item');
			anchors.forEach(a => a.addEventListener('click', handleClick));
			runUserJavaScript();
			clicked = false;
		});
	});
}

anchors.forEach(a => a.addEventListener('click', handleClick));


function confirmBeforeNavigate(event) {
	const query = event.currentTarget.dataset.confirm;
	if (!confirm(query ? `Are you sure you want to ${query}?` : 'Are you sure?')) event.preventDefault();
}

document.querySelectorAll('[data-confirm]').forEach(anchor => anchor.addEventListener('click', confirmBeforeNavigate));
