import autoAnimate from '/autoAnimate.js';

const links = [...document.querySelectorAll('a[href^="#"]')];

const validTabs = links.map(link => link.getAttribute('href').slice(1));
if (!validTabs.includes(window.location.hash.slice(1))) window.location.hash = validTabs[1];

const markActive = link => {
	const oldActive = links.find(link => link.classList.contains('active'));
	if (oldActive) {
		oldActive.classList.remove('active');
		oldActive.ariaCurrent = 'false';
	}

	link.classList.add('active');
	link.ariaCurrent = 'page';
};

markActive(links.find(link => link.getAttribute('href') === window.location.hash));

links.forEach(link => link.addEventListener('click', event => {
	event.preventDefault();

	history.pushState({}, '', link.href);
	history.pushState({}, '', link.href);
	history.back();

	markActive(link);
}));


(() => {

	const sorting = document.querySelector('#sorting-list');
	const list = JSON.parse(sorting.dataset.list);
	const sortStates = JSON.parse(sorting.dataset.sortStates);

	let playing = false;
	async function playAnimation() {
		if (playing) {
			playing = false;
			return setTimeout(playAnimation, 1000);
		}
		playing = true;
		this.textContent = 'Replay Animaion';
	
		sorting.innerHTML = '';
		const rate = 10000 / (sortStates.length - 5);
		for (const [s, state] of sortStates.entries()) {
			for (let i = 0; i <= state.order.length; i++) {
				const index = i < state.order.length ? state.order[i] : -1;
				let li;
				if (sorting.children[i]?.dataset.index == index) {
					li = sorting.children[i];
				} else {
					li = document.createElement('li');
					li.dataset.index = index;
					li.textContent = index || '';
					sorting.insertBefore(li, sorting.children[i]);
				}
				li.dataset.sorting = !!state.current;
				li.dataset.possible = state.current ? i >= state.current.min && i <= state.current.max : false;
				li.dataset.selected = state.current ? i === state.current.min && i === state.current.max : false;
				li.dataset.comparing = state.current ? i === state.current.try : false;
			}

			await new Promise(resolve => setTimeout(resolve, s < 5 ? 1000 : rate));
			if (!playing) return;
		}

		playing = false;
		this.textContent = 'Play Animaion';
	}

	autoAnimate(sorting);
	document.querySelector('#sorting-container button').addEventListener('click', playAnimation);
})();

function confirmBeforeNavigate(event) {
	const query = event.currentTarget.dataset.confirm;
	if (!confirm(query ? `Are you sure you want to ${query}?` : 'Are you sure?')) event.preventDefault();
}

document.querySelectorAll('[data-confirm]').forEach(anchor => anchor.addEventListener('click', confirmBeforeNavigate));

window.addEventListener('keydown', event => {
	if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

	if (((event.ctrlKey || event.metaKey) && event.key === 'f') || event.key === '/') {
		event.preventDefault();
		const details = document.querySelector('#search-details');
		if (!details.open) details.open = true;
		document.querySelector('#query').focus();
	}
});
