/// <reference types="cypress" />

describe('sign in', () => {
	beforeEach(() => {
		cy.visit('http://localhost:1337/');
	});

	it('requires password', () => {
		cy.contains('Sign Up').click();
		cy.get('#username').type('test');
		cy.get('form > button').click();
		cy.get('input:invalid').should('have.length', 1)
		cy.get('#password').then($input =>
			expect($input[0].validationMessage).to.eq('Please fill out this field.')
		)
	});

	it('requires username', () => {
		cy.contains('Sign Up').click();
		cy.get('#password').type('test');
		cy.get('form > button').click();
		cy.get('input:invalid').should('have.length', 1)
		cy.get('#username').then($input =>
			expect($input[0].validationMessage).to.eq('Please fill out this field.')
		)
	});

	it('creates user', () => {
		const username = Date.now();

		cy.contains('Sign Up').click();
		cy.get('#username').type(username);
		cy.get('#password').type('signup');
		cy.get('form > button').click();
		cy.contains(`Logout of ${username}`);
	});

	it('can\'t signup as existing user', () => {
		const username = Date.now();

		cy.contains('Sign Up').click();
		cy.get('#username').type(username);
		cy.get('#password').type('signup');
		cy.get('form > button').click();
		cy.contains(`Logout of ${username}`).click();

		cy.contains('Sign Up').click();
		cy.get('#username').type(username);
		cy.get('#password').type('signup');
		cy.get('form > button').click();
		cy.contains('Username already exists');
	});
});
