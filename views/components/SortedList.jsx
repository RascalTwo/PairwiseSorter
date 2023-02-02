import React from 'react';
import ItemContent from './ItemContent';
import { applyQueryToItems } from '../helpers'

export default ({ list, order, query, highlightQueryMatches, showAll, progress }) => <ul className="list-group" id="sorted-tab">
	<li className="list-group-item d-flex justify-content-between align-items-center">
		<form className="w-100">
			<input type="hidden" name="showAll" value={!showAll} />
			<button className="btn btn-info float-end">{showAll ? 'Show Only Incomplete' : 'Show All'}</button>
		</form>
	</li>

	{applyQueryToItems(order.map(i => list.items[i]).filter(item => item && (showAll || !item.completedAt)), query, !!list.htmlGeneratingCode).map(({ _id, name, display, completedAt }) =>
		<li key={_id} className={`list-group-item d-flex justify-content-between align-items-center ${display ? '' : 'd-none'}`}>
			<ItemContent name={name} htmlGenerated={!!list.htmlGeneratingCode} query={query} highlightQueryMatches={highlightQueryMatches} />
			<div className="btn-group" role="group" aria-label="Item Actions">
				{progress === 1 ? <a className="btn btn-danger" href={`/list/${list._id}/${_id}?_method=DELETE&returnTab=sorted-tab`}>Delete</a> : null}
				<a className="btn btn-info" href={`/list/${list._id}/${_id}/completed?_method=PATCH&value=${!completedAt}`}>Mark {completedAt ? 'Incomplete' : 'Complete'}</a>
			</div>
		</li>
	)}
</ul>;
