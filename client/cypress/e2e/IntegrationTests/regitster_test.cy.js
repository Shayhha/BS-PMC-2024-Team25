describe('Open app and go to Register page', () => {

    it('click the hero icon, open the dropdown, and click Register button', () => {
        // Visit the Landing page
        cy.visit(`${Cypress.env('baseUrl')}`);
        cy.viewport(Cypress.env('viewportWidth'), Cypress.env('viewportHeight'));

        // Select and click the hero icon
        cy.get('[data-testid="cypress-login-dropdown"]').last().click();

        // Select and click the Register button
        cy.get('[data-testid="cypress-register-button"]').click({ force: true });

        // Assert that the Register page is opened
        cy.url().should('include', '/register');

        

        // Get the username input, type into it
        cy.get('[data-testid="cypress-register-username-input"]').type('e2eTest').should('have.value', 'e2eTest');

        // Get the email input, type into it
        cy.get('[data-testid="cypress-register-email-input"]').type('e2eTest@email.com').should('have.value', 'e2eTest@email.com');

        // Get the password input, type into it
        cy.get('[data-testid="cypress-register-password-input"]').type('e2eTest').should('have.value', 'e2eTest');

        // Get the name input, type into it
        cy.get('[data-testid="cypress-register-name-input"]').type('firstname').should('have.value', 'firstname');

        // Get the last name input, type into it
        cy.get('[data-testid="cypress-register-lastname-input"]').type('lastname').should('have.value', 'lastname');

        // Get the worker type select, select 'Coder'
        cy.get('[data-testid="cypress-register-worker-type-select"]').select('Coder').should('have.value', 'Coder');



        // Intercept the register POST request
        cy.intercept('POST', 'http://127.0.0.1:8090/homepage/register').as('registerRequest');

        // Click the register button
        cy.get('.register-button').click();

        // Wait for the request to complete
        cy.wait('@registerRequest').then((interception) => {
        // Assert that the response status is 200
        expect(interception.response.statusCode).to.eq(201);

        // Wait for redirection
        cy.url().should('include', '/login');
        });

        // Wait to see that everything loads properly
        cy.wait(1000);

        cy.request({
            method: 'POST',
            url: 'http://127.0.0.1:8090/removeUsers/deleteUserByName',
            body: {
              userName: 'e2eTest'
            },
            headers: {
              'Content-Type': 'application/json'
            }
        }).then((response) => {
            // Optionally, you can add assertions to check the response
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq('User removed successfully');
        });
    });
  });
  