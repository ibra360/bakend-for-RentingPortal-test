const express = require("express");
const bodyParser = require("body-parser");
const HttpError = require("./models/http-error");
const adsRoutes = require("./routes/ads-routes");
const usersRoutes = require("./routes/users-routes");

const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

app.use("/api/ads", adsRoutes);
app.use("/api/users", usersRoutes);
app.use((req, res, next) => {
  const error = new HttpError("COuld not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "UNKNOWN ERROR OCCURED BRO" });
});
mongoose
  .connect(
    "mongodb+srv://abd:abd123@bismillah-f5fdy.mongodb.net/Renting?retryWrites=true&w=majority",{ useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(error);
  });
