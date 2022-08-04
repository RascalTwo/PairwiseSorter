import React from 'react';

export default ({ list, listProgress }) => <h1 class="text-center">
	<a href={`/list/${list._id$}`}>{list.name}</a>
	{listProgress
		? <small title="List sorted percentage">- {(listProgress * 100).toFixed(0)}%</small>
		: null
	}
</h1>;
