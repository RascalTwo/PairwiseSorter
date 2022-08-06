const alertAnchor = document.querySelector('.alert');
if (alertAnchor) alertAnchor.addEventListener('click', (e) => {
	e.preventDefault();
	alertAnchor.remove();
});

document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
