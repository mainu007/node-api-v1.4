const express = require("express");
const morgan = require("morgan");

//http
const app = express();
//bring in routes
const postRoutes = require("./routes/post");

//middleware
app.use(morgan("dev"));
app.use("/", postRoutes);

//host server and port
const port = 8080;
app.listen(port, () => console.log(`Running server port: ${port}`));
