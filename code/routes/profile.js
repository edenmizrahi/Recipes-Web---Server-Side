var express = require("express");
var router = express.Router();
const DButils = require("../modules/DButils");

//authentication:
router.use((req,res,next)=>{
    if (req.session && req.session.user_id) {
        // or findOne Stored Procedure
        DButils.execQuery("SELECT * FROM dbo.users").then((users) => {
          if (users.find((x) => x.user_id === req.session.user_id)) {
            req.user_id = req.session.user_id;
            user=users.find((x) => x.user_id === req.session.user_id);
            req.user=user.username;
            // req.session.user_id = user_id; //refresh the session value
            // res.locals.user_id = user_id;
            next();
          } else throw { status: 401, message: "unauthorized" };
        });
      } else {
        throw { status: 401, message: "unauthorized" };
      }
});

router.post("/", function (req, res) {
    res.send(req.user);
  });
router.get("/favorites", function (req, res) {
  res.send(req.originalUrl);
});

router.get("/personalRecipes", function (req, res) {
  res.send(req.originalUrl);
});

//#region example2 - make add Recipe endpoint

//#region complex
// router.use("/addPersonalRecipe", function (req, res, next) {
//   if (req.session && req.session.user_id) {
//     // or findOne Stored Procedure
//     DButils.execQuery("SELECT user_id FROM dbo.users").then((users) => {
//       if (users.find((x) => x.user_id === req.session.user_id)) {
//         req.user_id = req.session.user_id;
//         // req.session.user_id = user_id; //refresh the session value
//         // res.locals.user_id = user_id;
//         next();
//       } else throw { status: 401, message: "unauthorized" };
//     });
//   } else {
//     throw { status: 401, message: "unauthorized" };
//   }
// });

//#endregion

//#region simple
function valid_cookie(cookie) {
  return true;
}

router.use("/addPersonalRecipe", (req, res, next) => {
  const { cookie } = req.body;
  if (cookie && valid_cookie(cookie)) {
    req.username = cookie.username;
    next();
  } else throw { status: 401, message: "unauthorized" };
});
// //#endregion

router.post("/addPersonalRecipe", async (req, res, next) => {
  try {
    await DButils.execQuery(
      `INSERT INTO recipes VALUES (default, '${req.user_id}', '${req.body.recipe_name}')`
    );
    res.send({ sucess: true });
  } catch (error) {
    next(error);
  }
});
//#endregion

module.exports = router;
