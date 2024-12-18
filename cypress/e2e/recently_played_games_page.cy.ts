describe('recently played games page', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage()
  })

  it('no games played', () => {
    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'no-played-games.json' }).as('getRecentlyPlayedGames')

    cy.authenticate('player', 'player-secret')
    cy.visit('/')

    cy.wait('@getRecentlyPlayedGames').its('response.body')
      .should('deep.equal', [])

    cy.url().should('include', '/games')
    cy.contains('No games played yet')
  })

  it('recently played games list with refresh', () => {
    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'recently-played-games-1.json' }).as('getRecentlyPlayedGames')

    cy.authenticate('player', 'player-secret')
    cy.visit('/')

    cy.wait('@getRecentlyPlayedGames').its('response.body')
      .should('have.length', 1)

    cy.url().should('include', '/games')
    cy.contains('Colin McRae Rally')

    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'recently-played-games-2.json' }).as('getRecentlyPlayedGamesTwo')

    cy.get('.refresh-button').click()

    cy.wait('@getRecentlyPlayedGamesTwo').its('response.body')
      .should('have.length', 2)

    cy.get('.game-list li').eq(0).contains('Colin McRae Rally')
    cy.get('.game-list li').eq(1).contains('Kirby & The Amazing Mirror')
  })

  it('logout', () => {
    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'no-played-games.json' }).as('getRecentlyPlayedGames')

    cy.authenticate('player', 'player-secret')
    cy.visit('/')

    cy.contains('Logout').click()

    cy.get('.confirm-button').click()

    cy.getAllLocalStorage().should('be.empty')

    cy.url().should('include', '/login')
  })
})
