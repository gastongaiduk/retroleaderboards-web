import {} from 'cypress' 

Cypress.Commands.add('authenticate', (username: string, webApiKey: string) => {
    cy.visit('/login')
    cy.get('input[id="username"]').type(username)
    cy.get('input[id="key"]').type(webApiKey)
    cy.contains('Submit').click()
  })

Cypress.Commands.add('interceptUsersIFollow', () => {
    cy.intercept('GET', '**/API/API_GetUsersIFollow.php*', { fixture: 'users-i-follow.json' }).as('getUsersIFollow')
})

declare global {
  namespace Cypress {
    interface Chainable {
      authenticate(username: string, webApiKey: string): Chainable<void>
      interceptUsersIFollow(): Chainable<void>
    }
  }
}
