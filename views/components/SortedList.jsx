import React from 'react';
import ItemContent from './ItemContent';
import { filterQueriedItems } from '../helpers'

export default ({ list, order, query, highlightQueryMatches }) => <ul className="list-group" id="sorted-tab">
	{filterQueriedItems(order.map(i => list.items[i]).filter(item => item && !item.completedAt), query, !!list.htmlGeneratingCode).map(({ _id, name }) =>
		<li key={_id} className="list-group-item d-flex justify-content-between align-items-center">
			<ItemContent name={name} htmlGenerated={!!list.htmlGeneratingCode} query={query} highlightQueryMatches={highlightQueryMatches} />
			<a className="btn btn-info" href={`/list/${list._id}/${_id}/completed?_method=PATCH&value=true`}>Mark Complete</a>
		</li>
	)}
</ul>;
