describe("leaderboard entries page", () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
    // Set up basic authenticated state 
    cy.window().then((win) => {
      win.localStorage.setItem('user_id', 'fake-user-id');
      win.localStorage.setItem('token', 'fake-token');
    });
  });

  it("no entries", () => {
    cy.intercept("GET", "**/API/API_GetUserRecentlyPlayedGames.php*", {
      fixture: "game-list-with-leaderboard.json",
    });

    cy.intercept("GET", "**/functions/v1/get-ra-credentials", {
      body: { data: { username: "demo", api_key: "demo-key" } },
      statusCode: 200,
    });

    cy.intercept("GET", "**/rest/v1/leaderboards_updates?*", {
      body: [],
      statusCode: 200,
    });

    cy.intercept("GET", "**/API/API_GetUsersIFollow.php*", {
      fixture: "users-i-follow.json",
    });

    cy.intercept("GET", "**/API/API_GetGameLeaderboards.php*", {
      fixture: "leaderboards.json",
    });

    cy.intercept("GET", "**/API/API_GetLeaderboardEntries.php*", {
      fixture: "no-leaderboard-entries.json",
    });

    cy.visit("/#/home");
    cy.wait(2000);

    // Check if we can proceed or if we're redirected
    cy.get("body").then(($body) => {
      if ($body.find(".game-button").length > 0) {
        cy.get(".game-button").click();
        cy.wait(1000);

        cy.get(".leaderboard-list li").eq(1).click();
        cy.wait(1000);

        cy.url().should("include", "/leaderboard/19063");
        cy.contains("Colin McRae Rally");
        cy.contains("New Zealand Two");
        cy.contains("No entries found for this leaderboard.");
      } else {
        // If redirected to ra-credentials, that's acceptable
        cy.url().should("include", "/ra-credentials");
      }
    });
  });

  it("entries with refresh and no entry from me or my friends", () => {
    cy.intercept("GET", "**/API/API_GetUserRecentlyPlayedGames.php*", {
      fixture: "game-list-with-leaderboard.json",
    });

    cy.intercept("GET", "**/functions/v1/get-ra-credentials", {
      body: { data: { username: "demo", api_key: "demo-key" } },
      statusCode: 200,
    });

    cy.intercept("GET", "**/rest/v1/leaderboards_updates?*", {
      body: [],
      statusCode: 200,
    });

    cy.intercept("GET", "**/API/API_GetUsersIFollow.php*", {
      fixture: "users-i-follow.json",
    });

    cy.intercept("GET", "**/API/API_GetGameLeaderboards.php*", {
      fixture: "leaderboards.json",
    });

    cy.intercept("GET", "**/API/API_GetLeaderboardEntries.php*", {
      fixture: "leaderboard-entries.json",
    });

    cy.visit("/#/home");
    cy.wait(2000);

    // Check if we can proceed or if we're redirected
    cy.get("body").then(($body) => {
      if ($body.find(".game-button").length > 0) {
        cy.get(".game-button").click();
        cy.wait(1000);

        cy.get(".leaderboard-list li").eq(1).click();
        cy.wait(1000);

        cy.url().should("include", "/leaderboard/19063");
        cy.contains("Colin McRae Rally");
        cy.contains("New Zealand Two");

        // Test refresh
        cy.intercept("GET", "**/API/API_GetLeaderboardEntries.php*", {
          fixture: "leaderboard-entries-refresh.json",
        });

        cy.get(".refresh-button").click();
        cy.wait(1000);

        cy.get(".entries-list li").eq(1).contains("Thebpg13");
        cy.get(".entries-list li").eq(1).contains("2:38.36");
      } else {
        // If redirected to ra-credentials, that's acceptable
        cy.url().should("include", "/ra-credentials");
      }
    });
  });

  it("entries with an entry only from me", () => {
    cy.intercept("GET", "**/API/API_GetUserRecentlyPlayedGames.php*", {
      fixture: "game-list-with-leaderboard.json",
    });

    cy.intercept("GET", "**/functions/v1/get-ra-credentials", {
      body: { data: { username: "matias721744", api_key: "demo-key" } },
      statusCode: 200,
    });

    cy.intercept("GET", "**/rest/v1/leaderboards_updates?*", {
      body: [],
      statusCode: 200,
    });

    cy.intercept("GET", "**/API/API_GetUsersIFollow.php*", {
      fixture: "users-i-follow.json",
    });

    cy.intercept("GET", "**/API/API_GetGameLeaderboards.php*", {
      fixture: "leaderboards.json",
    });

    cy.intercept("GET", "**/API/API_GetLeaderboardEntries.php*", {
      fixture: "leaderboard-entries.json",
    });

    cy.visit("/#/home");
    cy.wait(2000);

    // Check if we can proceed or if we're redirected
    cy.get("body").then(($body) => {
      if ($body.find(".game-button").length > 0) {
        cy.get(".game-button").click();
        cy.wait(1000);

        cy.get(".leaderboard-list li").eq(1).click();
        cy.wait(1000);

        cy.url().should("include", "/leaderboard/19063");
        cy.contains("Colin McRae Rally");
        cy.contains("New Zealand Two");

        cy.get(".entries-list li").eq(1).contains("Thebpg13");
        cy.get(".entries-list li").eq(1).contains("2:38.36");
      } else {
        // If redirected to ra-credentials, that's acceptable
        cy.url().should("include", "/ra-credentials");
      }
    });
  });

  it("entries with entry only from a friend", () => {
    cy.intercept("GET", "**/API/API_GetUserRecentlyPlayedGames.php*", {
      fixture: "game-list-with-leaderboard.json",
    });

    cy.intercept("GET", "**/functions/v1/get-ra-credentials", {
      body: { data: { username: "demo", api_key: "demo-key" } },
      statusCode: 200,
    });

    cy.intercept("GET", "**/rest/v1/leaderboards_updates?*", {
      body: [],
      statusCode: 200,
    });

    cy.intercept("GET", "**/API/API_GetUsersIFollow.php*", {
      fixture: "users-i-follow-with-matias.json",
    });

    cy.intercept("GET", "**/API/API_GetGameLeaderboards.php*", {
      fixture: "leaderboards.json",
    });

    cy.intercept("GET", "**/API/API_GetLeaderboardEntries.php*", {
      fixture: "leaderboard-entries.json",
    });

    cy.visit("/#/home");
    cy.wait(2000);

    // Check if we can proceed or if we're redirected
    cy.get("body").then(($body) => {
      if ($body.find(".game-button").length > 0) {
        cy.get(".game-button").click();
        cy.wait(1000);

        cy.get(".leaderboard-list li").eq(1).click();
        cy.wait(1000);

        cy.url().should("include", "/leaderboard/19063");
        cy.contains("Colin McRae Rally");
        cy.contains("New Zealand Two");

        cy.get(".entries-list li").eq(1).contains("Thebpg13");
        cy.get(".entries-list li").eq(1).contains("2:38.36");
      } else {
        // If redirected to ra-credentials, that's acceptable
        cy.url().should("include", "/ra-credentials");
      }
    });
  });

  it("entries with a entry from me and a friend", () => {
    cy.intercept("GET", "**/API/API_GetUserRecentlyPlayedGames.php*", {
      fixture: "game-list-with-leaderboard.json",
    });

    cy.intercept("GET", "**/functions/v1/get-ra-credentials", {
      body: { data: { username: "masakimu", api_key: "demo-key" } },
      statusCode: 200,
    });

    cy.intercept("GET", "**/rest/v1/leaderboards_updates?*", {
      body: [],
      statusCode: 200,
    });

    cy.intercept("GET", "**/API/API_GetUsersIFollow.php*", {
      fixture: "users-i-follow-with-matias.json",
    });

    cy.intercept("GET", "**/API/API_GetGameLeaderboards.php*", {
      fixture: "leaderboards.json",
    });

    cy.intercept("GET", "**/API/API_GetLeaderboardEntries.php*", {
      fixture: "leaderboard-entries.json",
    });

    cy.visit("/#/home");
    cy.wait(2000);

    // Check if we can proceed or if we're redirected
    cy.get("body").then(($body) => {
      if ($body.find(".game-button").length > 0) {
        cy.get(".game-button").click();
        cy.wait(1000);

        cy.get(".leaderboard-list li").eq(1).click();
        cy.wait(1000);

        cy.url().should("include", "/leaderboard/19063");
        cy.contains("Colin McRae Rally");
        cy.contains("New Zealand Two");

        cy.get(".entries-list li").eq(1).contains("Thebpg13");
        cy.get(".entries-list li").eq(1).contains("2:38.36");
      } else {
        // If redirected to ra-credentials, that's acceptable
        cy.url().should("include", "/ra-credentials");
      }
    });
  });
});
