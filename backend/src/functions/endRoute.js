const { app } = require("@azure/functions");
const { routes, routePoints, routeSummaries } = require("../../shared/cosmosClient");

app.http("endRoute", {
  methods: ["POST"],
  route: "routes/{routeId}/end",
  authLevel: "anonymous",
  handler: async (req, context) => {
    try {
      const routeId = req.params.routeId;

      // 1. Get route document FIRST (to get correct partition key)
      const { resources: routeResults } = await routes.items.query({
        query: "SELECT * FROM c WHERE c.routeId = @routeId",
        parameters: [{ name: "@routeId", value: routeId }]
      }).fetchAll();

      if (!routeResults.length) {
        return { status: 404, body: "Route not found" };
      }

      const route = routeResults[0];

      // 2. Get points
      const { resources: points } = await routePoints.items.query({
        query: "SELECT * FROM c WHERE c.routeId = @routeId ORDER BY c.ts",
        parameters: [{ name: "@routeId", value: routeId }]
      }).fetchAll();

      if (!points.length) {
        return { status: 404, body: "No points found" };
      }

      // 3. Basic analytics
      const start = points[0];
      const end = points[points.length - 1];

      const durationSeconds = end.ts - start.ts;

      const summary = {
        id: routeId,
        routeId,
        userId: route.userId,
        pointCount: points.length,
        durationSeconds,
        completedAt: new Date().toISOString()
      };

      // 4. Save summary
      await routeSummaries.items.upsert(summary);

      // 5. Patch route with CORRECT partition key
      await routes.item(route.id, route.userId).patch([
        { op: "replace", path: "/status", value: "completed" },
        { op: "add", path: "/endTime", value: new Date().toISOString() }
      ]);

      return { status: 200, jsonBody: summary };

    } catch (err) {
      context.log("END ROUTE ERROR:", err);
      return { status: 500, body: "Failed to end route" };
    }
  }
});
