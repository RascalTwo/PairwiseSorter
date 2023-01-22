import React from 'react';
import { applyQueryToItems } from '../helpers';
import ItemContent from './ItemContent';

export default ({ list, isOwner, denormalizedComparisons, query, highlightQueryMatches }) => <ul className="list-group comparisons-list" id="comparisons-tab">
	{denormalizedComparisons.map(comparison => {
		const aItem = list.items.find(item => item._id == comparison.a);
		const bItem = list.items.find(item => item._id == comparison.b);
		const display = applyQueryToItems([aItem, bItem], query, !!list.htmlGeneratingCode).some(i => i.display);
		return <li key={comparison.a + '-' + comparison.b} className={`list-group-item d-flex justify-content-between align-items-center position-relative ${display ? '' : 'd-none'}`} data-queries-left="2">
			<div><ItemContent name={aItem.name} htmlGenerated={!!list.htmlGeneratingCode} query={query} highlightQueryMatches={highlightQueryMatches} /></div>
			<ul className="position-absolute top-50 start-50 translate-middle">
				<div>{comparison.result === 1 ? '<' : comparison.result === 0 ? '===' : '>'}</div>
				{isOwner
					? <a className="btn btn-primary" href={`/list/${list._id}/${comparison.a}/${comparison.b}?_method=DELETE`}>Delete</a>
					: null
				}
			</ul>
			<div><ItemContent name={bItem.name} htmlGenerated={!!list.htmlGeneratingCode} query={query} highlightQueryMatches={highlightQueryMatches} /></div>
		</li>
	})
}
</ul>;

