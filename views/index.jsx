import React from 'react';
import Main from './Main';

export default function Index(mainProps) {
	return <Main {...mainProps}>
		<p className="container">Allows you to sort a list of items by comparing items in pairs efficiently!</p>
	</Main>;
}