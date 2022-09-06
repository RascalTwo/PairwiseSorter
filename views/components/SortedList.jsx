import React from 'react';
import ItemContent from './ItemContent';

export default ({ list, order }) => <ul className="list-group" id="sorted-tab">
	{order.map(i => list.items[i]).filter(item => item && !item.completedAt).map(({ _id, name }) =>
		<li key={_id} className="list-group-item"><ItemContent name={name} htmlGenerated={!!list.htmlGeneratingCode} /></li>
	)}
</ul>;
