import React from 'react';

export default ({ list, progress }) => <h1 className="text-center">
	<a href={`/list/${list._id}`}>{list.name}</a>
	{progress
		? <small title="List sorted percentage">- {(progress * 100).toFixed(0)}%</small>
		: null
	}
</h1>;
