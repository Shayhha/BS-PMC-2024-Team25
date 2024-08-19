describe('Open app and go to Login page', () => {

  it('click the hero icon, open the dropdown, and click Login button', () => {
    // Visit the Landing page
    cy.visit(`${Cypress.env('baseUrl')}`);
    cy.viewport(Cypress.env('viewportWidth'), Cypress.env('viewportHeight'));
    
    // Select and click the hero icon
    cy.get('[data-testid="cypress-login-dropdown"]').last().click();

    // Select and click the Login button
    cy.get('[data-testid="cypress-login-button"]').click({ force: true });

    // Assert that the login page is opened
    cy.url().should('include', '/login');

    

    // Get the email input, type into it
    cy.get('[data-testid="cypress-login-email-input"]').type('max@max.com')

    //  Verify that the value has been updated
    cy.get('[data-testid="cypress-login-email-input"]').should('have.value', 'max@max.com')
    
    // Get the password input, type into it
    cy.get('[data-testid="cypress-login-password-input"]').type('Max123')

    //  Verify that the value has been updated
    cy.get('[data-testid="cypress-login-password-input"]').should('have.value', 'Max123')



    // Intercept the login POST request
    cy.intercept('POST', 'http://127.0.0.1:8090/homepage/login').as('loginRequest');

    // Click the login button
    cy.get('.login-button').click();

    // Wait for the request to complete
    cy.wait('@loginRequest').then((interception) => {
      // Assert that the response status is 200
      expect(interception.response.statusCode).to.eq(200);

      // Wait for redirection
      cy.url().should('include', '/admin');
    });

    // Wait to see that everything loads properly
    cy.wait(2000);



    // Select and click the logout icon
    cy.get('[data-testid="cypress-logout-dropdown"]').last().click();

    // Select and click the Logout button
    cy.get('[data-testid="cypress-logout-button"]').click({ force: true });

    // Assert that the landing page is opened
    cy.url().should('not.include', '/admin');
  });
});
