import React from 'react';
import ItemContent from './ItemContent';

export default ({ list, isOwner, denormalizedComparisons }) => <ul className="list-group comparisons-list" id="comparisons-tab">
	{denormalizedComparisons.map(comparison =>
		<li key={comparison.a + '-' + comparison.b} className="list-group-item d-flex justify-content-between align-items-center position-relative">
			<div><ItemContent name={list.items.find(item => item._id == comparison.a).name} /></div>
			<ul className="position-absolute top-50 start-50 translate-middle">
				<div>{comparison.result === 1 ? '<' : comparison.result === 0 ? '===' : '>'}</div>
				{isOwner
					? <a className="btn btn-primary" href={`/list/${list._id}/${comparison.a}/${comparison.b}?_method=DELETE`}>Delete</a>
					: null
				}
			</ul>
			<div><ItemContent name={list.items.find(item => item._id == comparison.b).name} /></div>
		</li>
	)}
</ul>;

