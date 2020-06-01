var express = require("express");
var router = express.Router();
const DButils = require("../modules/DButils");
const profile_utils=require("../modules/profile_utils")

//authentication:
router.use((req,res,next)=>{
    if (req.session && req.session.user_id) {
        //check if user is valid 
          DButils.execQuery("SELECT * FROM users").then((users) => {
          if (users.find((x) => x.user_id === req.session.user_id)) {
            req.user_id = req.session.user_id;
            user=users.find((x) => x.user_id === req.session.user_id);
            req.user=user.username;
           next();   
          } else throw { status: 401, message: "unauthorized" };
        }).catch((err)=>{
          throw { status: 401, message: "unauthorized" };
        });
      } else {
        throw { status: 401, message: "unauthorized" };
      }
});

router.get("/recipeInfo/:ids",(req,res)=>{
  
  const recipes_ids_list=JSON.parse(req.params.ids);
  (profile_utils.getRecipeProfileInfo(req.user,recipes_ids_list)).then((theResult)=>{
    res.send(theResult);
  }).catch((err)=>{
      throw { status: err.status, message: eww.message };
  })
  
  });

router.post("/", function (req, res) {
  result=JSON.stringify(req.user_recupe_details);
  console.log(result);
    res.send(JSON.stringify(req.user_recupe_details));
  });
router.get("/favorites", function (req, res) {

  res.send(req.originalUrl);
});

router.get("/personalRecipes", function (req, res) {
  res.send(req.originalUrl);
});



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
