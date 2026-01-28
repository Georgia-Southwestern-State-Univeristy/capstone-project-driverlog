const { app } = require("@azure/functions");

app.setup({ enableHttpStream: true });

// load all functions through one file
require("./src");
