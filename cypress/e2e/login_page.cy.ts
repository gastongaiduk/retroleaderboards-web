describe("login page", () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
  });

  it("unauthorized", () => {
    cy.visit("/#/login");

    cy.url().should("include", "/login");
    cy.contains("Log in");

    cy.get('input[id="email"]').type("unauthorized");
    cy.get('input[id="pass"]').type("unauthorized-secret");

    cy.intercept("POST", "**/auth/v1/token?*", {
      body: { message: "Bad credentials" },
      statusCode: 401,
    }).as("auth");

    cy.contains("Log in").click();

    cy.wait("@auth").its("response.statusCode").should("equal", 401);

    cy.on("window:alert", (txt) => {
      expect(txt).to.contains("Bad credentials");
    });

    cy.url().should("include", "/login");
    cy.contains("Log in");
  });

  it("success-without-ra-credentials", () => {
    cy.interceptRACredentials(false, "demo", "demo-key");
    cy.interceptLeaderboardsUpdates();
    
    cy.visit("/#/login");

    cy.url().should("include", "/login");
    cy.contains("Log in");

    cy.get('input[id="email"]').type("user@retroleaderboards.app");
    cy.get('input[id="pass"]').type("user-secret");

    cy.intercept("POST", "**/auth/v1/token?*", {
      fixture: "supabase.auth-granted.json",
    }).as("auth");

    cy.contains("Log in").click();

    cy.wait("@auth").its("response.statusCode").should("equal", 200);
    cy.wait("@raCredentials").its("response.statusCode").should("equal", 400);

    cy.url().should("include", "/ra-credentials");
    cy.contains("Set your RA credentials");
  });

  it("success-with-ra-credentials", () => {
    cy.interceptRACredentials(true, "demo", "demo-key");
    cy.interceptLeaderboardsUpdates();
    cy.intercept("GET", "**/rest/v1/leaderboards_updates?*", {
      body: {},
      statusCode: 200,
    }).as("leaderboardsUpdates");
    cy.intercept("GET", "**/API/API_GetUserRecentlyPlayedGames.php*", {
      fixture: "no-played-games.json",
      statusCode: 200,
    }).as("getRecentlyPlayedGames");
    
    cy.visit("/#/login");

    cy.url().should("include", "/login");
    cy.contains("Log in");

    cy.get('input[id="email"]').type("user@retroleaderboards.app");
    cy.get('input[id="pass"]').type("user-secret");

    cy.intercept("POST", "**/auth/v1/token?*", {
      fixture: "supabase.auth-granted.json",
    }).as("auth");

    cy.contains("Log in").click();

    cy.wait("@auth").its("response.statusCode").should("equal", 200);
    cy.wait("@raCredentials").its("response.statusCode").should("equal", 200);
    cy.wait("@leaderboardsUpdates");
    cy.wait("@getRecentlyPlayedGames");

    cy.url().should("include", "/home");
    cy.contains("Welcome");
  });
});
