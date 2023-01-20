import React from 'react';
import Main from './Main';


export default function Error({ message, ...mainProps}) {
	return <Main {...mainProps}>
		<p>Looks like something went wrong...</p>
		{message ? <pre><code>{message}</code></pre> : null}
	</Main>;
}
