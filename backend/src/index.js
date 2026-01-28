const { app } = require('@azure/functions');

app.setup({
    enableHttpStream: true,
});
require("./functions/startRoute");
require("./functions/endRoute");
require("./functions/uploadPoints");