describe('recently played games page', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage()
  })

  it('no games played', () => {
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
    cy.contains('No games played yet')
  })

  it('recently played games list with refresh', () => {
    cy.visit('/')

    cy.url().should('include', '/login')
    cy.contains('Authenticate')

    cy.get('input[id="username"]').type('example')
    cy.get('input[id="key"]').type('example-secret')

    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'recently-played-games-1.json' }).as('getRecentlyPlayedGames')

    cy.contains('Submit').click()

    cy.wait('@getRecentlyPlayedGames').its('response.body')
      .should('have.length', 1)

    cy.url().should('include', '/games')
    cy.contains('Colin McRae Rally')

    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'recently-played-games-2.json' }).as('getRecentlyPlayedGames')

    cy.get('.refresh-button').click()

    cy.wait('@getRecentlyPlayedGames').its('response.body')
      .should('have.length', 2)

    cy.get('.game-list li').eq(0).contains('Colin McRae Rally')
    cy.get('.game-list li').eq(1).contains('Kirby & The Amazing Mirror')
  })

  it('logout', () => {
    cy.visit('/')

    cy.url().should('include', '/login')
    cy.contains('Authenticate')

    cy.get('input[id="username"]').type('player')
    cy.get('input[id="key"]').type('player-secret')

    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'no-played-games.json' }).as('getRecentlyPlayedGames')

    cy.contains('Submit').click()

    cy.wait('@getRecentlyPlayedGames').its('response.body')
      .should('deep.equal', [])

    cy.contains('Logout').click()

    cy.get('.confirm-button').click()

    cy.getAllLocalStorage().should('be.empty')

    cy.url().should('include', '/login')
  })
})
