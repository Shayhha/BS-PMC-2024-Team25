describe('Open app, login into a Tester account and add a new bug', () => {

    it('login into the app and click the plus icon on the bottom right side, then enter the new bug data and add it to the app', () => {
        // Visit the Landing page
        cy.visit(`${Cypress.env('baseUrl')}/login`);
        cy.viewport(Cypress.env('viewportWidth'), Cypress.env('viewportHeight') + 500);

        // Get the email input, type into it
        cy.get('[data-testid="cypress-login-email-input"]').type('ayman@ayman.com')
        
        // Get the password input, type into it
        cy.get('[data-testid="cypress-login-password-input"]').type('Ayman123')
    
    
    
        // Intercept the login POST request
        cy.intercept('POST', 'http://127.0.0.1:8090/homepage/login').as('loginRequest');
    
        // Click the login button
        cy.get('.login-button').click();
    
        // Wait for the request to complete
        cy.wait('@loginRequest').then((interception) => {
            // Assert that the response status is 200
            expect(interception.response.statusCode).to.eq(200);
    
            // Wait for redirection
            cy.url().should('include', '/tester');
        });
    
        // Wait to see that everything loads properly
        cy.wait(1000);
    
        // Click the add bug button
        cy.get('[data-testid="cypress-add-bug-button"]').click();

        // Check that the popup is visible
        cy.get('[data-testid="cypress-add-bug-popup"]').should('be.visible');


    
        // Insert all the data into the form:
        // Get the title input, type into it
        cy.get('[data-testid="cypress-add-bug-title-input"]').type('e2eTest').should('have.value', 'e2eTest');

        // Get the description input, type into it
        cy.get('[data-testid="cypress-add-bug-description-input"]').type('this is a test bug description 1 2 3').should('have.value', 'this is a test bug description 1 2 3');

        // Get the status input, type into it
        cy.get('[data-testid="cypress-add-bug-status-select"]').select('Done').should('have.value', 'Done');

        // Get the category input, type into it
        cy.get('[data-testid="cypress-add-bug-category-select"]').select('Ui').should('have.value', 'Ui');

        // Get the assignTo input, type into it
        cy.get('[data-testid="cypress-add-bug-assigned-to-select"]').select('None').should('have.value', 'None');

        // Get the open date input, type into it
        cy.get('[data-testid="cypress-add-bug-opendate-input"]').type('2024-10-19').should('have.value', '2024-10-19');

        // Get the close date input, type into it
        cy.get('[data-testid="cypress-add-bug-closedate-input"]').type('2024-10-25').should('have.value', '2024-10-25');

        // Click the submit bug button
        cy.get('[data-testid="cypress-add-bug-submit-button"]').click();

        // Wait to see that everything loads properly
        cy.wait(3000);

        // Find the div with the new bug info that was just added
        cy.get('div.tester_inner_container').contains('p', 'e2eTest').should('exist');


        // Remove the new bug that was added
        cy.request({
            method: 'POST',
            url: 'http://127.0.0.1:8090/homePage/removeBugByTitle',
            body: {
                bugName: 'e2eTest'
            },
            headers: {
              'Content-Type': 'application/json'
            }
        }).then((response) => {
            // Optionally, you can add assertions to check the response
            expect(response.status).to.eq(200);
        });

        cy.wait(1000);


        // Logout of the account
        // Select and click the logout icon
        cy.get('[data-testid="cypress-logout-dropdown"]').last().click();

        // Select and click the Logout button
        cy.get('[data-testid="cypress-logout-button"]').click({ force: true });
    
        // Assert that the landing page is opened
        cy.url().should('not.include', '/tester');
    });
  });
  