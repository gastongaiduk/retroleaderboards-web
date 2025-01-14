import {} from "cypress";

Cypress.Commands.add("authenticate", (granted = true) => {
  cy.visit("/#/login");
  cy.get('input[id="email"]').type("user@retroleaderboards.app");
  cy.get('input[id="pass"]').type("user-secret");
  if (granted) {
    cy.intercept("POST", "**/auth/v1/token?grant_type*", {
      fixture: "supabase.auth-granted.json",
    });
  } else {
    cy.intercept("POST", "**/auth/v1/token?grant_type*", {
      body: { message: "Bad credentials" },
      statusCode: 401,
    });
  }
  cy.contains("Submit").click();
});

Cypress.Commands.add(
  "interceptRACredentials",
  (existing = true, username = "demo", apiKey = "demo-key") => {
    if (existing) {
      cy.intercept("GET", "**/functions/v1/get-ra-credentials", {
        body: {
          data: {
            username: username,
            api_key: apiKey,
          },
        },
        statusCode: 200,
      });
    } else {
      cy.intercept("GET", "**/functions/v1/get-ra-credentials", {
        fixture: "supabase.ra-credentials-bad.json",
        statusCode: 400,
      });
    }
  },
);

Cypress.Commands.add("interceptLeaderboardsUpdates", () => {
  cy.intercept("OPTIONS", "**/rest/v1/leaderboards_updates?*", {
    statusCode: 200,
  });
  cy.intercept("GET", "**/rest/v1/leaderboards_updates?*", {
    body: {},
    statusCode: 200,
  });
});

Cypress.Commands.add("interceptGameSubscription", (subscribed = true) => {
  if (subscribed) {
    cy.intercept("GET", "**/rest/v1/game_subscriptions?*", {
      body: {
        user_id: "b6fb8bca-f451-4bde-99c3-8354e3ca27cf",
        game_id: 1,
        created_at: "2025-01-01T22:37:36.833282+00:00",
      },
      statusCode: 200,
    });
  } else {
    cy.intercept("GET", "**/rest/v1/game_subscriptions?*", {
      body: {},
      statusCode: 200,
    });
  }
});

Cypress.Commands.add("interceptUsersIFollow", () => {
  cy.intercept("GET", "**/API/API_GetUsersIFollow.php*", {
    fixture: "users-i-follow.json",
  }).as("getUsersIFollow");
});

declare global {
  namespace Cypress {
    interface Chainable {
      authenticate(granted = true): Chainable<void>;
      interceptRACredentials(
        existing: boolean,
        username: string,
        apiKey: string,
      ): Chainable<void>;
      interceptLeaderboardsUpdates(): Chainable<void>;
      interceptGameSubscription(subscribed: boolean): Chainable<void>;
      interceptUsersIFollow(): Chainable<void>;
    }
  }
}
