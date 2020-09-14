const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
//dotenv config
require("dotenv").config();

//DB
mongoose
   .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   })
   .then(() => console.log("DB Connected"));

mongoose.connection.on("error", (err) => {
   console.log(`DB error: ${err}`);
});
//http
const app = express();
//bring in routes
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");

//middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use("/", postRoutes);
app.use("/", authRoutes);

//host server and port
const port = 8080;
app.listen(port, () => console.log(`Running server port: ${port}`));
