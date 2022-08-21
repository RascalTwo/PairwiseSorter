const alertAnchor = document.querySelector('.alert');
if (alertAnchor) alertAnchor.addEventListener('click', (e) => {
	e.preventDefault();
	alertAnchor.remove();
});

const executions = (() => {
	const SPINNER = '<div class="spinner-border" role="status"></div>';
	const consentedCode = JSON.parse(localStorage.getItem('r2-consented-code') || '{}');

	const executions = new Map();

	let executing = false;
	async function startExecutions() {
		if (executing) return;

		for (const [key, targets] of [...executions.entries()]) {
			const { base64, name } = JSON.parse(key);

			const html = await new Promise((resolve, reject) => {
				const plugin = new jailed.DynamicPlugin(`
					${atob(base64)}

					application.setInterface({
						generateHTMLAsCallback(name, callback){
							generateHTML(name).then(callback).catch(callback);
						}
					});`,
					{}
				)
				plugin.whenConnected(() => plugin.remote.generateHTMLAsCallback(name, resolve));
				plugin.whenFailed(reject);
			});

			for (const target of targets) target.innerHTML = html;
			executions.delete(key);
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

		for (const itemNameEl of document.querySelectorAll(`[data-html-generating-code="${base64}"] .item-name`)) {
			itemNameEl.insertAdjacentHTML('beforeend', SPINNER);
			itemNameEl.querySelector('button').remove();
			const key = JSON.stringify(getKey(itemNameEl));
			executions.set(key, [...(executions.get(key) || []), itemNameEl]);
		}

		return startExecutions().catch(console.error).finally(() => executing = false);
	}

	for (const itemNameEl of document.querySelectorAll('[data-html-generating-code] .item-name')) {
		itemNameEl.childNodes[0].remove();

		const key = getKey(itemNameEl);

		if (consentedCode[key.base64] === true) {
			const keyStr = JSON.stringify(key);
			executions.set(keyStr, [...(executions.get(keyStr) || []), itemNameEl]);
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

	startExecutions().catch(console.error).finally(() => executing = false);

	return executions;
})();

document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
