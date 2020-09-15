const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
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
const userRoutes = require("./routes/user");

//middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/", postRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use(function (err, req, res, next) {
   if (err.name === "UnauthorizedError") {
      res.status(401).json({ error: "Unauthorized" });
   }
});

//host server and port
const port = 8080;
app.listen(port, () => console.log(`Running server port: ${port}`));
