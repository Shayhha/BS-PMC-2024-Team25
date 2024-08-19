describe('Open app, login into a Coder account and change the username', () => {

    it('login into the app and click the gear icon, then enter the new username and submit the changes', () => {
        // Visit the Landing page
        cy.visit(`${Cypress.env('baseUrl')}/login`);
        cy.viewport(Cypress.env('viewportWidth'), Cypress.env('viewportHeight'));

        // Get the email input, type into it
        cy.get('[data-testid="cypress-login-email-input"]').type('shay@shay.com')
        
        // Get the password input, type into it
        cy.get('[data-testid="cypress-login-password-input"]').type('Shay123')
    
    
    
        // Intercept the login POST request
        cy.intercept('POST', 'http://127.0.0.1:8090/homepage/login').as('loginRequest');
    
        // Click the login button
        cy.get('.login-button').click();
    
        // Wait for the request to complete
        cy.wait('@loginRequest').then((interception) => {
            // Assert that the response status is 200
            expect(interception.response.statusCode).to.eq(200);
    
            // Wait for redirection
            cy.url().should('include', '/coder');
        });
    
        // Wait to see that everything loads properly
        cy.wait(1000);
    
    
    
        // Select and click the hero icon
        cy.get('[data-testid="cypress-settings-dropdown-div"]').last().click();

        // Select and click the Login button
        cy.get('[data-testid="cypress-settings-button"]').click({ force: true });

        // Wait to see that everything loads properly
        cy.wait(500)

        // Wait for redirection
        cy.url().should('include', '/edituser');



        // Get the username input, type into it a new username
        cy.get('[data-testid="cypress-edituser-username-input"]').clear().type('ShayTest');

        //  Verify that the value has been updated
        cy.get('[data-testid="cypress-edituser-username-input"]').should('have.value', 'ShayTest');

        // Select and click the submit username button
        cy.get('[data-testid="cypress-edituser-username-submit-button"]').click();

        // Listen for the window:alert event
        cy.on('window:alert', (alertText) => {
            // Assert that the alert text matches the expected value
            expect(alertText).to.equal('User info updated successfully.');
        });

        // Return data back to normal:
        // Get the username input, type into it a new username
        cy.get('[data-testid="cypress-edituser-username-input"]').clear().type('Shay');

        //  Verify that the value has been updated
        cy.get('[data-testid="cypress-edituser-username-input"]').should('have.value', 'Shay');

        // Select and click the submit username button
        cy.get('[data-testid="cypress-edituser-username-submit-button"]').click();



        // Logout of the account
        // Select and click the logout icon
        cy.get('[data-testid="cypress-logout-dropdown"]').last().click();

        // Select and click the Logout button
        cy.get('[data-testid="cypress-logout-button"]').click({ force: true });
    
        // Assert that the landing page is opened
        cy.url().should('not.include', '/edituser');
    });
  });
  