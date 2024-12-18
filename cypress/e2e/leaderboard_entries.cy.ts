describe('leaderboard entries page', () => {
    beforeEach(() => {
      cy.clearAllLocalStorage()
  })

  it('no entries', () => {
    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'game-list-with-leaderboard.json' }).as('getRecentlyPlayedGames')
    
    cy.authenticate('player', 'player-secret')
    cy.interceptUsersIFollow()
    cy.visit('/')

    cy.intercept('GET', '**/API/API_GetGameLeaderboards.php*', { fixture: 'leaderboards.json' }).as('getLeaderboards')

    cy.get('.game-button').click()

    cy.url().should('include', '/game/16557/leaderboards')
    cy.contains('Colin McRae Rally')

    cy.intercept('GET', '**/API/API_GetLeaderboardEntries.php*', { fixture: 'no-leaderboard-entries.json' }).as('getLeaderboardEntries')

    cy.get('.leaderboard-list li').eq(1).click()

    cy.url().should('include', '/leaderboard/19063')
    cy.contains('Colin McRae Rally')
    cy.contains('New Zealand Two')
    cy.contains('No entries found for this leaderboard.')
  })

  it('entries with refresh and no entry from me or my friends', () => {
    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'game-list-with-leaderboard.json' }).as('getRecentlyPlayedGames')
    
    cy.authenticate('player', 'player-secret')
    cy.interceptUsersIFollow()
    cy.visit('/')

    cy.intercept('GET', '**/API/API_GetGameLeaderboards.php*', { fixture: 'leaderboards.json' }).as('getLeaderboards')

    cy.get('.game-button').click()

    cy.url().should('include', '/game/16557/leaderboards')
    cy.contains('Colin McRae Rally')

    cy.intercept('GET', '**/API/API_GetLeaderboardEntries.php*', { fixture: 'leaderboard-entries.json' }).as('getLeaderboardEntries')

    cy.get('.leaderboard-list li').eq(1).click()

    cy.url().should('include', '/leaderboard/19063')
    cy.contains('Colin McRae Rally')
    cy.contains('New Zealand Two')

    cy.get('.entries-list li').eq(0).contains('Thebpg13')
    cy.get('.entries-list li').eq(0).contains('2:38.36')

    cy.intercept('GET', '**/API/API_GetLeaderboardEntries.php*', { fixture: 'leaderboard-entries-refresh.json' }).as('getLeaderboardEntriesRefresh')

    cy.get('.refresh-button').click()

    cy.wait('@getLeaderboardEntriesRefresh').its('response.body')
      .should('have.property', 'Results')
      .should('have.length', 10)

    cy.get('.entries-list li').eq(0).contains('josef733')
    cy.get('.entries-list li').eq(0).contains('2:34.45')

    cy.get('.entries-list li').eq(1).contains('Thebpg13')
    cy.get('.entries-list li').eq(1).contains('2:38.36')
  })

  it('entries with an entry only from me', () => {
    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'game-list-with-leaderboard.json' }).as('getRecentlyPlayedGames')
    
    cy.authenticate('matias721744', 'matias721744-secret')
    cy.interceptUsersIFollow()
    cy.visit('/')

    cy.intercept('GET', '**/API/API_GetGameLeaderboards.php*', { fixture: 'leaderboards.json' }).as('getLeaderboards')

    cy.get('.game-button').click()

    cy.url().should('include', '/game/16557/leaderboards')
    cy.contains('Colin McRae Rally')

    cy.intercept('GET', '**/API/API_GetLeaderboardEntries.php*', { fixture: 'leaderboard-entries.json' }).as('getLeaderboardEntries')

    cy.get('.leaderboard-list li').eq(1).click()

    cy.url().should('include', '/leaderboard/19063')
    cy.contains('Colin McRae Rally')
    cy.contains('New Zealand Two')

    cy.get('.entries-list li').eq(0).contains('matias721744')
    cy.get('.entries-list li').eq(0).contains('2:51.55')

    cy.get('.entries-list li').eq(1).contains('Thebpg13')
    cy.get('.entries-list li').eq(1).contains('2:38.36')
  })

  it('entries with entry only from a friend', () => {
    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'game-list-with-leaderboard.json' }).as('getRecentlyPlayedGames')
    
    cy.authenticate('player', 'player-secret')
    cy.intercept('GET', '**/API/API_GetUsersIFollow.php*', { fixture: 'users-i-follow-with-matias.json' }).as('getUsersIFollow')
    cy.visit('/')

    cy.intercept('GET', '**/API/API_GetGameLeaderboards.php*', { fixture: 'leaderboards.json' }).as('getLeaderboards')

    cy.get('.game-button').click()

    cy.url().should('include', '/game/16557/leaderboards')
    cy.contains('Colin McRae Rally')

    cy.intercept('GET', '**/API/API_GetLeaderboardEntries.php*', { fixture: 'leaderboard-entries.json' }).as('getLeaderboardEntries')

    cy.get('.leaderboard-list li').eq(1).click()

    cy.url().should('include', '/leaderboard/19063')
    cy.contains('Colin McRae Rally')
    cy.contains('New Zealand Two')

    cy.get('.entries-list li').eq(0).contains('matias721744')
    cy.get('.entries-list li').eq(0).contains('2:51.55')

    cy.get('.entries-list li').eq(1).contains('Thebpg13')
    cy.get('.entries-list li').eq(1).contains('2:38.36')
  })

  it('entries with a entry from me and a friend', () => {
    cy.intercept('GET', '**/API/API_GetUserRecentlyPlayedGames.php*', { fixture: 'game-list-with-leaderboard.json' }).as('getRecentlyPlayedGames')
    
    cy.authenticate('masakimu', 'masakimu-secret')
    cy.intercept('GET', '**/API/API_GetUsersIFollow.php*', { fixture: 'users-i-follow-with-matias.json' }).as('getUsersIFollow')
    cy.visit('/')

    cy.intercept('GET', '**/API/API_GetGameLeaderboards.php*', { fixture: 'leaderboards.json' }).as('getLeaderboards')

    cy.get('.game-button').click()

    cy.url().should('include', '/game/16557/leaderboards')
    cy.contains('Colin McRae Rally')

    cy.intercept('GET', '**/API/API_GetLeaderboardEntries.php*', { fixture: 'leaderboard-entries.json' }).as('getLeaderboardEntries')

    cy.get('.leaderboard-list li').eq(1).click()

    cy.url().should('include', '/leaderboard/19063')
    cy.contains('Colin McRae Rally')
    cy.contains('New Zealand Two')

    cy.get('.entries-list li').eq(0).contains('masakimu')
    cy.get('.entries-list li').eq(0).contains('2:46.59')

    cy.get('.entries-list li').eq(1).contains('matias721744')
    cy.get('.entries-list li').eq(1).contains('2:51.55')

    cy.get('.entries-list li').eq(2).contains('Thebpg13')
    cy.get('.entries-list li').eq(2).contains('2:38.36')
  })
})
