const alertAnchor = document.querySelector('.alert');
if (alertAnchor) alertAnchor.addEventListener('click', (e) => {
	e.preventDefault();
	alertAnchor.remove();
});
