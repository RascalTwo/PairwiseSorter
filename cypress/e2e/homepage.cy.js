/// <reference types="cypress" />

describe('page loads', () => {
	beforeEach(() => {
		cy.visit('http://localhost:1337/');
	});


	it('homepage is displayed', () => {
		cy.contains('Pairwise Sorter');
		cy.contains('Login');
	});
});
