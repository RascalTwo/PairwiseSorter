
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