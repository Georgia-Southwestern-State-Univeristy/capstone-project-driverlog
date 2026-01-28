const { app } = require("@azure/functions");

app.setup({ enableHttpStream: true });

// 🔥 load your actual app
require("./src");
