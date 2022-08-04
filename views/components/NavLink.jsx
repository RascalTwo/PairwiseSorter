import React from 'react';

export default ({ url, href, content }) => <li className="nav-item">
	<a
		className={`nav-link ${url === href ? 'active' : ''}`}
		href={href}
		aria-current={url === href ? 'page' : undefined}
	>
		{content}
	</a>
</li>;