require("dotenv").config();
//#region express configures
var express = require("express");
var path = require("path");
var logger = require("morgan");
// const session = require("client-sessions");
// const DButils = require("./modules/DButils");

var app = express();
app.use(logger("dev")); //logger
app.use(express.json()); // parse application/json
// app.use(
//   session({
//     cookieName: "session", // the cookie key name
//     secret: process.env.COOKIE_SECRET, // the encryption key
//     duration: 20 * 60 * 1000, // expired after 20 sec
//     activeDuration: 0 // if expiresIn < activeDuration,
//     //the session will be extended by activeDuration milliseconds
//   })
// );
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files

var port = process.env.PORT || "4000";
//#endregion
// const users_authentication = require("./routes/users_authentication");
// const profile = require("./routes/profile");
const recipe = require("./routes/recipes");
//#region cookie middleware

//#endregion

app.get("/", (req, res) => res.send("welcome"));

// app.use("/profile", profile);
app.use("/recipes", recipe);
// app.use(users_authentication);

//not found
app.use((req,res)=>{
    res.sendStatus(404);
})


app.use(function (err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).send({ message: err.message, success: false });
});

const server = app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});

process.on("SIGINT", function () {
  if (server) {
    server.close(() => console.log("server closed"));
  }
  process.exit();
});
