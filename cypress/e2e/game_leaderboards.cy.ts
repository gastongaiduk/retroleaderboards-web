describe('game leaderboards page', () => {
    beforeEach(() => {
      cy.clearAllLocalStorage()
  })

  it('no leaderboards', () => {
    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'game-list-without-leaderboard.json' }).as('getRecentlyPlayedGames')

    cy.interceptRACredentials()
    cy.authenticate()
    cy.interceptLeaderboardsUpdates()
    cy.visit('/')

    cy.intercept('GET', '**/API/API_GetGameLeaderboards.php*', { fixture: 'no-leaderboards.json' }).as('getLeaderboards')

    cy.get('.game-button').click()

    cy.wait('@getLeaderboards').its('response.body')
      .should('have.property', 'Results')

    cy.url().should('include', '/game/769/leaderboards')
    cy.contains('Kirby & The Amazing Mirror')
    cy.contains('No leaderboards found for this game.')
  })

  it('leaderboards list with refresh', () => {
    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'game-list-with-leaderboard.json' }).as('getRecentlyPlayedGames')

    cy.interceptRACredentials()
    cy.authenticate()
    cy.interceptLeaderboardsUpdates()
    cy.interceptGameSubscription(false)
    cy.visit('/')

    cy.intercept('GET', '**/API/API_GetGameLeaderboards.php*', { fixture: 'leaderboards.json' }).as('getLeaderboards')

    cy.get('.game-button').click()

    cy.wait('@getLeaderboards').its('response.body')
      .should('have.property', 'Results')
      .should('have.length', 10)

    cy.url().should('include', '/game/16557/leaderboards')
    cy.contains('Colin McRae Rally')

    cy.get('.leaderboard-list li').eq(1).contains('New Zealand Two')
    cy.get('.leaderboard-list li').eq(1).contains('Thebpg13')
    cy.get('.leaderboard-list li').eq(1).contains('2:38.36')

    cy.intercept('GET', '**/API/API_GetGameLeaderboards.php*', { fixture: 'leaderboards-refresh.json' }).as('getLeaderboardsRefresh')

    cy.get('.refresh-button').click()

    cy.wait('@getLeaderboardsRefresh').its('response.body')
      .should('have.property', 'Results')
      .should('have.length', 10)

    cy.get('.leaderboard-list li').eq(1).contains('New Zealand Two')
    cy.get('.leaderboard-list li').eq(1).contains('zuliman92')
    cy.get('.leaderboard-list li').eq(1).contains('2:35.23')
  })

  it('go back to recently played games', () => {
    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'game-list-with-leaderboard.json' }).as('getRecentlyPlayedGames')

    cy.interceptRACredentials()
    cy.authenticate()
    cy.interceptLeaderboardsUpdates()
    cy.interceptGameSubscription(false)
    cy.visit('/')

    cy.intercept('GET', '**/API/API_GetGameLeaderboards.php*', { fixture: 'leaderboards.json' }).as('getLeaderboards')

    cy.visit('#/game/16557/leaderboards')

    cy.get('.back-button').click()

    cy.url().should('include', '/home')
  })
})
