import React from 'react';
import Main from './Main';
import AuthForm from './components/AuthForm';

export default function SignUp(mainProps) {
	return <Main {...mainProps}>
		<AuthForm user={mainProps.user} text="Login" action="login" oauthAvailable={mainProps.oauthAvailable} />
	</Main>;
}