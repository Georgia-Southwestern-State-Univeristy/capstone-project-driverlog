const { app } = require("@azure/functions");
const { v4: uuid } = require("uuid");
const { routes } = require("../../shared/cosmosClient");

app.http("startRoute", {
  methods: ["POST"],
  route: "routes/start",
  authLevel: "anonymous",
  handler: async (req, context) => {
    try {
      const userId = "test-user"; // later from Entra ID

      const routeId = `r-${uuid()}`;

      const route = {
        id: routeId,
        routeId,
        userId,
        status: "active",
        startTime: new Date().toISOString()
      };

      await routes.items.create(route);

      return {
        status: 201,
        jsonBody: { routeId }
      };

    } catch (err) {
      context.log(err);
      return { status: 500, body: "Failed to start route" };
    }
  }
});

