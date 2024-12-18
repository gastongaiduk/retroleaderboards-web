describe('login page', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage()
  })

  it('unauthorized', () => {
    cy.visit('/')

    cy.url().should('include', '/login')
    cy.contains('Authenticate')

    cy.get('input[id="username"]').type('unauthorized')
    cy.get('input[id="key"]').type('unauthorized-secret')

    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { statusCode: 401 }).as('getRecentlyPlayedGames')

    cy.contains('Submit').click()

    cy.wait('@getRecentlyPlayedGames').its('response.statusCode')
      .should('equal', 401)

    cy.on('window:alert', (txt) => {
      expect(txt).to.contains('Bad credentials');
    })

    cy.url().should('include', '/login')
    cy.contains('Authenticate')
  })

  it('success', () => {
    cy.visit('/')

    cy.url().should('include', '/login')
    cy.contains('Authenticate')

    cy.get('input[id="username"]').type('player')
    cy.get('input[id="key"]').type('player-secret')

    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'no-played-games.json' }).as('getRecentlyPlayedGames')

    cy.contains('Submit').click()

    cy.wait('@getRecentlyPlayedGames').its('response.body')
      .should('deep.equal', [])

    cy.url().should('include', '/games')
  })
})
