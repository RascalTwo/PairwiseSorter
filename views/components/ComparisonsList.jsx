import React from 'react';
import { filterQueriedItems } from '../helpers';
import ItemContent from './ItemContent';

export default ({ list, isOwner, denormalizedComparisons, query, highlightQueryMatches }) => <ul className="list-group comparisons-list" id="comparisons-tab">
	{denormalizedComparisons.filter(comparison => filterQueriedItems([list.items.find(item => item._id == comparison.a), list.items.find(item => item._id == comparison.b)], query, !!list.htmlGeneratingCode).length).map(comparison =>
		<li key={comparison.a + '-' + comparison.b} className="list-group-item d-flex justify-content-between align-items-center position-relative" data-queries-left="2">
			<div><ItemContent name={list.items.find(item => item._id == comparison.a).name} htmlGenerated={!!list.htmlGeneratingCode} query={query} highlightQueryMatches={highlightQueryMatches} /></div>
			<ul className="position-absolute top-50 start-50 translate-middle">
				<div>{comparison.result === 1 ? '<' : comparison.result === 0 ? '===' : '>'}</div>
				{isOwner
					? <a className="btn btn-primary" href={`/list/${list._id}/${comparison.a}/${comparison.b}?_method=DELETE`}>Delete</a>
					: null
				}
			</ul>
			<div><ItemContent name={list.items.find(item => item._id == comparison.b).name} htmlGenerated={!!list.htmlGeneratingCode} query={query} highlightQueryMatches={highlightQueryMatches} /></div>
		</li>
	)}
</ul>;

