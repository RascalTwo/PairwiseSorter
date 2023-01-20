import React from 'react';
import ItemContent from './ItemContent';

export default ({ list, order }) => <ul className="list-group" id="sorted-tab">
	{order.map(i => list.items[i]).filter(item => item && !item.completedAt).map(({ _id, name }) =>
		<li key={_id} className="list-group-item d-flex justify-content-between align-items-center">
			<ItemContent name={name} htmlGenerated={!!list.htmlGeneratingCode} />
			<a className="btn btn-info" href={`/list/${list._id}/${_id}/completed?_method=PATCH&value=true`}>Mark Complete</a>
		</li>
	)}
</ul>;
