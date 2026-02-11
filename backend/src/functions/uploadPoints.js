const { app } = require("@azure/functions");
const { routePoints } = require("../../shared/cosmosClient");


app.http("uploadPoints", {
  methods: ["POST"],
  route: "routes/{routeId}/points",
  authLevel: "anonymous",
  handler: async (req, context) => {
    try {
      const routeId = req.params.routeId;
      const body = await req.json();
      const points = body?.points;

      //Get client json file sent for logging
      context.log("HTTP request body:", body);

      if (!routeId || !Array.isArray(points)) {
        return { status: 400, body: "Invalid payload" };
      }

      const operations = points.map(p => ({
        operationType: "Create",
        resourceBody: {
          id: `${routeId}_${p.ts}`,
          routeId,
          ...p
        }
      }));

      context.log("Inserting", operations.length, "points");

      await routePoints.items.bulk(operations);

      return {
        status: 200,
        jsonBody: { inserted: points.length }
      };

    } catch (err) {
      context.log(err);
      return { status: 500, body: "Failed to ingest points" };
    }
  }
});


