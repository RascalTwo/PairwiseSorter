import React from 'react';

export default ({ name, htmlGenerated, query, highlightQueryMatches }) => <div className="item-name-wrapper">
	<span className="item-name" data-item-name={JSON.stringify(name)}>{query && highlightQueryMatches ? name.split(new RegExp(`(${query})`, 'ig')).map(part => new RegExp(query, 'ig').test(part) ? <mark>{part}</mark> : part) : name}</span>
	<div style={{ display: htmlGenerated ? 'flex' : 'none' }}>
		<span className="form-check form-switch">
			<input className="form-check-input" autoComplete="off" type="checkbox" role="switch" style={{ marginLeft: 0 }} id={performance.now()} checked />
		</span>
		<button className="btn btn-secondary regenerate-button" title="Regenerate HTML">⟳</button>
	</div>
</div>