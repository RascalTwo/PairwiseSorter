const alertAnchor = document.querySelector('.alert');
if (alertAnchor) alertAnchor.addEventListener('click', (e) => {
	e.preventDefault();
	alertAnchor.remove();
});

const runUserJavaScript = (() => {
	const SPINNER = '<div class="spinner-border" role="status"></div>';
	const consentedCode = JSON.parse(localStorage.getItem('r2-consented-code') || '{}');
	const cachedExecutions = new Map(Object.entries(JSON.parse(localStorage.getItem('r2-code-executions') || '{}')));

	const root = document.querySelector('[data-html-generating-code]')
	const query = root?.dataset.query;
	const highlightQueryMatches = root?.dataset.highlightQueryMatches === 'true';
	const queryRegex = new RegExp(`(${query})`, 'ig');

	let executing = false;
	async function startExecutions(executions) {
		while (executing) await new Promise(r => setTimeout(r, 1000));
		executing = true;

		try {
			for (const [key, targets] of [...executions.entries()]) {
				const { base64, name } = JSON.parse(key);

				let html = await new Promise((resolve, reject) => {
					const cached = cachedExecutions.get(base64) || {};
					if (name in cached) return resolve(cached[name]);

					const plugin = new jailed.DynamicPlugin(`
						${atob(base64)}

						application.setInterface({
							generateHTMLAsCallback(name, callback){
								generateHTML(name).then(callback).catch(callback);
							}
						});`,
						{}
					)
					plugin.whenConnected(() => plugin.remote.generateHTMLAsCallback(name, html => {
						cached[name] = html;
						if (!cachedExecutions.has(base64)) cachedExecutions.set(base64, cached);

						localStorage.setItem('r2-code-executions', JSON.stringify(Object.fromEntries(cachedExecutions.entries())));
						return resolve(html);
					}));
					plugin.whenFailed(reject);
				});

				if (query) {
					if (!queryRegex.test(html)) for (const target of targets) {
						const li = target.closest('li');
						if (li.dataset.queriesLeft) {
							const newQueriesLeft = Number(li.dataset.queriesLeft) - 1;
							if (!newQueriesLeft) li.remove();
							li.dataset.queriesLeft = newQueriesLeft;
						} else li.remove();
					};
					if (highlightQueryMatches) html = html.replace(queryRegex, '<mark>$1</mark>');
				}
				for (const target of targets) target.innerHTML = html;
			}
		} catch (e) {
			console.error(e);
		} finally {
			executing = false;
		}
	}

	const getKey = itemNameEl => ({
		base64: itemNameEl.closest('[data-html-generating-code]').dataset.htmlGeneratingCode,
		name: JSON.parse(itemNameEl.dataset.itemName)
	})

	function handleConsentButton() {
		const base64 = this.closest('[data-html-generating-code]').dataset.htmlGeneratingCode
		consentedCode[base64] = true;
		localStorage.setItem('r2-consented-code', JSON.stringify(consentedCode));

		const executions = new Map();
		for (const itemNameEl of document.querySelectorAll(`[data-html-generating-code="${base64}"] .item-name`)) {
			itemNameEl.insertAdjacentHTML('beforeend', SPINNER);
			itemNameEl.querySelector('button').remove();
			const key = JSON.stringify(getKey(itemNameEl));
			executions.set(key, [...(executions.get(key) || []), itemNameEl]);
		}

		return startExecutions(executions);
	}

	const observer = new IntersectionObserver(entries => {
		for (const { target: itemNameEl, isIntersecting } of entries) {
			if (!isIntersecting) continue;
			observer.unobserve(itemNameEl);
			startExecutions(new Map([[JSON.stringify(getKey(itemNameEl)), [itemNameEl]]]));
		}
	}, { threshold: 1 });

	function start() {
		for (const itemNameEl of document.querySelectorAll('[data-html-generating-code] .item-name:not([data-processed])')) {
			itemNameEl.dataset.processed = true;
			itemNameEl.childNodes[0].remove();

			const key = getKey(itemNameEl);
			const keyStr = JSON.stringify(key);

			const checkbox = itemNameEl.parentNode.querySelector('input');
			checkbox.addEventListener('change', e => {
				if (e.currentTarget.checked) {
					itemNameEl.innerHTML = ''
					itemNameEl.insertAdjacentHTML('beforeend', SPINNER);
					return startExecutions(new Map([[keyStr, [itemNameEl]]]));
				} else {
					itemNameEl.innerHTML = key.name
				}
			})

			itemNameEl.parentNode.querySelector('button').addEventListener('click', () => {
				delete (cachedExecutions.get(key.base64) || {})[key.name];

				itemNameEl.innerHTML = ''
				itemNameEl.insertAdjacentHTML('beforeend', SPINNER);
				return startExecutions(new Map([[keyStr, [itemNameEl]]]));
			});

			if (consentedCode[key.base64] === true) {
				observer.observe(itemNameEl);
				itemNameEl.insertAdjacentHTML('beforeend', SPINNER);
				continue;
			}

			const itemName = JSON.parse(itemNameEl.dataset.itemName);

			const button = document.createElement('button');
			button.className = 'btn btn-primary';
			button.innerText = 'Consent to JavaScript';
			button.dataset.bsToggle = 'tooltip';
			button.dataset.bsTitle = itemName;
			button.title = itemName;
			button.type = 'button';
			button.addEventListener('click', handleConsentButton);

			itemNameEl.appendChild(button);
		}
	}

	return start;
})();

runUserJavaScript();

document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
