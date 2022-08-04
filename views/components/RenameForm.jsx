import React from 'react';

export default ({ list, title, defaultValue, returnTab }) => <form method="POST">
	<input type="hidden" name="_method" value="PATCH" />
	<label for="name" className="form-label">New {title} Name</label>
	<input type="text" className="form-control" id="name" name="name" required defaultValue={defaultValue} />
	<div className="btn-group float-end" role="group" aria-label="List Actions">
		<button className="btn btn-primary">Rename</button>
		<a href={`/list/${list._id}${returnTab ? '#' + returnTab : ''}`} className="btn btn-danger">Cancel</a>
	</div>
</form>;
