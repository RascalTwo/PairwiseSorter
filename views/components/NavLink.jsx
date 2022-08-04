import React from 'react';

export default ({ url, href, content }) => <li class="nav-item">
	<a
		className={`nav-link ${url === href ? 'active' : ''}`}
		href={href}
		ariaCurrent={url === href ? 'page' : undefined}
	>
		{content}
	</a>
</li>;