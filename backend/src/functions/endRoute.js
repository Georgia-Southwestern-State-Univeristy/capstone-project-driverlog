const { app } = require("@azure/functions");
const { routes, routePoints, routeSummaries } = require("../../shared/cosmosClient");
const { haversineDistance } = require("../../shared/haversine");

app.http("endRoute", {
  methods: ["POST"],
  route: "routes/{routeId}/end",
  authLevel: "anonymous",
  handler: async (req, context) => {
    try {
      const routeId = req.params.routeId;

      // 1. Fetch route to get correct partition key
      const { resources: routeResults } = await routes.items.query({
        query: "SELECT * FROM c WHERE c.routeId = @routeId",
        parameters: [{ name: "@routeId", value: routeId }]
      }).fetchAll();

      if (!routeResults.length) {
        return { status: 404, body: "Route not found" };
      }

      const route = routeResults[0];

      // 2. Fetch points in time order
      const { resources: points } = await routePoints.items.query({
        query: "SELECT * FROM c WHERE c.routeId = @routeId ORDER BY c.ts",
        parameters: [{ name: "@routeId", value: routeId }]
      }).fetchAll();

      if (points.length < 2) {
        return { status: 400, body: "Not enough points to calculate distance" };
      }

      // 3. Calculate distance
      let totalDistanceMeters = 0;

      for (let i = 1; i < points.length; i++) {
        totalDistanceMeters += haversineDistance(points[i - 1], points[i]);
      }

      const start = points[0];
      const end = points[points.length - 1];
      const durationSeconds = end.ts - start.ts;

      const avgSpeedMps =
        durationSeconds > 0 ? totalDistanceMeters / durationSeconds : 0;
      
      const summary = {
        id: routeId,
        routeId,
        userId: route.userId,

        pointCount: points.length,
        durationSeconds,

        totalDistanceMeters,
        totalDistanceMiles: totalDistanceMeters / 1609.344,
        averageSpeedMph: avgSpeedMps * 2.23694,

        completedAt: new Date().toISOString()
      };

      // 4. Save summary
      await routeSummaries.items.upsert(summary);

      // 5. Update route status
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