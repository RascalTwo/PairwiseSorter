const alertAnchor = document.querySelector('.alert');
if (alertAnchor) alertAnchor.addEventListener('click', (e) => {
	e.preventDefault();
	alertAnchor.remove();
});

const handleSearchVisibility = (() => {
	function getSearchParameters(query, highlightMatches){
		return {
			query,
			highlightMatches,
			regex: new RegExp(`(${query})`, 'i')
		}
	}
	const root = document.querySelector('[data-searchable]')

	const search = getSearchParameters(root?.dataset.query, root?.dataset.highlightQueryMatches === 'true');


	let updating = false;
	async function updateVisibilities(){
		while (updating) await new Promise(r => setTimeout(r, 1000));
		try {
			updating = true;
			document.querySelectorAll('[data-searchable] .item-name').forEach(handleSearchVisibility);
			return renderAllRemainingUserJavaScript();
		} finally {
			updating = false;
		}
	}

	document.querySelector('#query')?.addEventListener('input', e => {
		Object.assign(search, getSearchParameters(e.currentTarget.value, document.querySelector('#highlight').checked));
		return updateVisibilities();
	});
	document.querySelector('#highlight')?.addEventListener('change', e => {
		Object.assign(search, getSearchParameters(document.querySelector('#query').value, e.currentTarget.checked));
		return updateVisibilities();
	});

	function handleSearchVisibility(target){
		const text = target.innerText;
		const li = target.closest('li');

		if (search.query && !search.regex.test(text)) {
			if (li.dataset.queriesLeft) {
				const newQueriesLeft = Number(li.dataset.queriesLeft) - 1;
				if (!newQueriesLeft) li.classList.add('d-none');
				li.dataset.queriesLeft = newQueriesLeft;
			} else li.classList.add('d-none');
			return;
		}

		const marks = li.querySelectorAll('mark');
		for (const mark of marks) mark.parentNode.replaceChild(document.createTextNode(mark.innerText), mark);
		while (true){
			const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT, null, false);
			let changed = false;
			while (walker.nextNode()) {
				const node = walker.currentNode;
				const next = node.nextSibling;
				if (next && next.nodeType === Node.TEXT_NODE) {
					node.nodeValue += next.nodeValue;
					next.parentNode.removeChild(next);
					changed = true;
				}
			}
			if (!changed) break;
		}
		if (search.query && search.highlightMatches) {
			const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT, null, false);
			while (walker.nextNode()) {
				const node = walker.currentNode;
				const text = node.nodeValue;

				const matches = text.match(search.regex);
				if (!matches) continue;


				const parent = node.parentNode;

				const prefix = document.createTextNode(text.slice(0, matches.index));
				parent.insertBefore(prefix, node);

				const mark = document.createElement('mark');
				mark.innerText = matches[0];
				parent.insertBefore(mark, node);

				const suffix = document.createTextNode(text.slice(matches.index + matches[0].length));
				parent.insertBefore(suffix, node);

				parent.removeChild(node)
			}
		}
		if (li.dataset.queriesLeft) li.dataset.queriesLeft = 2;
		li.classList.remove('d-none');
	}

	return handleSearchVisibility;
})();

const { runUserJavaScript, renderAllRemainingUserJavaScript } = (() => {
	const SPINNER = '<div class="spinner-border" role="status"></div>';
	const consentedCode = JSON.parse(localStorage.getItem('r2-consented-code') || '{}');
	const cachedExecutions = new Map(Object.entries(JSON.parse(localStorage.getItem('r2-code-executions') || '{}')));


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

				for (const target of targets) {
					target.innerHTML = html;
					handleSearchVisibility(target);
				}
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
		for (const itemNameEl of document.querySelectorAll('[data-html-generating-code] .item-name')) {
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

	let allRendered = false;
	function renderAllRemainingUserJavaScript(){
		if (allRendered) return;
		allRendered = true;
		const executions = new Map();

		for (const itemNameEl of document.querySelectorAll(`[data-html-generating-code] .item-name`)) {
			const key = getKey(itemNameEl);
			if (consentedCode[key.base64]) {
				const keyStr = JSON.stringify(key);
				executions.set(keyStr, [...(executions.get(keyStr) || []), itemNameEl]);
			}
		}

		return startExecutions(executions);
	}

	return { runUserJavaScript: start, renderAllRemainingUserJavaScript };
})();

runUserJavaScript();

document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
