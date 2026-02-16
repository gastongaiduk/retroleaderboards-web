describe("updates page rich notifications", () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
    });
    beforeEach(() => {
        cy.clearAllLocalStorage();
        cy.window().then((win) => {
            win.localStorage.setItem('user_id', 'fake-user-id');
            win.localStorage.setItem('token', 'fake-token');
            // Set these to pass isSet() check
            win.localStorage.setItem('username', 'U2FsdGVkX1+qC375t1V47uPJIr0z3GdbmAAGpD3q+CA=');
            win.localStorage.setItem('key', 'U2FsdGVkX1+qC375t1V47uPJIr0z3GdbmAAGpD3q+CA=');
        });

        cy.intercept("GET", "**/functions/v1/get-ra-credentials", {
            body: { data: { username: "demo", api_key: "demo-key" } },
            statusCode: 200,
        });

        cy.intercept("GET", "**/API/API_GetUserRecentlyPlayedGames.php*", {
            body: { Results: [], Total: 0, Count: 0 },
            statusCode: 200,
        }).as('getRecentGames');

        cy.intercept("GET", "**/rest/v1/subscriptions?*", {
            body: [],
            statusCode: 200,
        });
    });

    it("should group updates by game and show differences", () => {
        const mockUpdates = [
            {
                leaderboard_id: 1,
                friend_name: "FriendA",
                user_score: 1000,
                friend_score: 1500,
                created_at: new Date().toISOString(),
                read_at: null,
                leaderboards: {
                    name: "High Score",
                    description: "Get the highest score",
                    game_id: 101,
                    format: "SCORE",
                    rank_asc: false,
                    games: {
                        name: "Legendary Game",
                        image_icon: "icon1.png"
                    }
                }
            },
            {
                leaderboard_id: 2,
                friend_name: "FriendB",
                user_score: 2000,
                friend_score: 2500,
                created_at: new Date().toISOString(),
                read_at: null,
                leaderboards: {
                    name: "Another LB",
                    description: "Another description",
                    game_id: 101,
                    format: "SCORE",
                    rank_asc: false,
                    games: {
                        name: "Legendary Game",
                        image_icon: "icon1.png"
                    }
                }
            },
            {
                leaderboard_id: 3,
                friend_name: "FriendC",
                user_score: 3600, // 60 seconds
                friend_score: 3540, // 59 seconds
                created_at: new Date().toISOString(),
                read_at: null,
                leaderboards: {
                    name: "Speedrun",
                    description: "Fastest time",
                    game_id: 102,
                    format: "TIME",
                    rank_asc: true,
                    games: {
                        name: "Racing Game",
                        image_icon: "icon2.png"
                    }
                }
            }
        ];

        cy.intercept("GET", "**/rest/v1/leaderboards_updates?*", {
            body: mockUpdates,
            statusCode: 200,
        });

        cy.visit("/#/leaderboards-updates");

        // Check grouping
        cy.get(".game-group").should("have.length", 2);

        // Check first group (Legendary Game)
        cy.get(".game-group").eq(0).within(() => {
            cy.get(".game-group-title").should("contain", "Legendary Game");
            cy.get(".game-item").should("have.length", 2);

            // Check difference for SCORE
            cy.get(".game-item").eq(0).contains("By 500");
        });

        // Check second group (Racing Game)
        cy.get(".game-group").eq(1).within(() => {
            cy.get(".game-group-title").should("contain", "Racing Game");
            cy.get(".game-item").should("have.length", 1);

            // Check difference for TIME
            // 3600 - 3540 = 60 frames = 1 second
            // Our formatter for TIME: 00:01.00
            cy.get(".game-item").eq(0).contains("By 00:01.00");
        });
    });
});
