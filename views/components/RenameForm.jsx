import React from 'react';

export default ({ list, title, defaultValue, returnTab }) => <form method="POST">
	<input type="hidden" name="_method" value="PATCH" />
	<label for="name" class="form-label">New {title} Name</label>
	<input type="text" class="form-control" id="name" name="name" required defaultValue={defaultValue} />
	<div class="btn-group float-end" role="group" aria-label="List Actions">
		<button class="btn btn-primary">Rename</button>
		<a href={`/list/${list._id}${returnTab ? '#' + returnTab : ''}`} class="btn btn-danger">Cancel</a>
	</div>
</form>;
