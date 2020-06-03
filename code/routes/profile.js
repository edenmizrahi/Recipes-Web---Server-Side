var express = require("express");
var router = express.Router();
const DButils = require("../modules/DButils");
const profile_utils = require("../modules/profile_utils");
const search_functions = require("../modules/search_recipes");

//authentication:
router.use((req, res, next) => {
  if (req.session && req.session.user_id) {
    //check if user is valid 
    DButils.execQuery("SELECT * FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        user = users.find((x) => x.user_id === req.session.user_id);
        req.user = user.username;
        next();
      } else throw { status: 401, message: "unauthorized" };
    }).catch((err) => {
      throw { status: 401, message: "unauthorized" };
    });
  } else {
    throw { status: 401, message: "unauthorized" };
  }
});

/**
 * get recipe's profile info(watched/favorite):
 * return dic{"45": object{watched :"0", favorite:"0"}} 
 */
router.get("/recipeInfo/:ids", (req, res, next) => {
  try {
    const recipes_ids_list = JSON.parse(req.params.ids);
    r = search_functions.getRecipesPreviewInfo(recipes_ids_list);
    (profile_utils.getRecipeProfileInfo(req.user, recipes_ids_list)).then((theResult) => {
      res.send(theResult[0]);
    }).catch((err) => {
      throw { status: err.status, message: err.message };
    })
  }
  catch (err) {
    next(err);
  }

});

/**
* return the latest top 3 watches
   @return 3 recipes pre-view  @todo: *******change*********
*/
router.get("/watchedList/top", async (req, res,next) => {
  try {
    top = await profile_utils.getTopThree(req.user);
    r = await search_functions.getRecipesPreviewInfo(top);
    res.send(r[0]);
  }
  catch (err) {
    next(err);
  }
});

/**
 * add $id to watch list of the user
 *  @return success or err
 */
router.post("/watchedList/add/:id", async (req, res) => {
  try {
    a = [];
    a.push(Number(req.params.id))
    r = await search_functions.getRecipesPreviewInfo(a);
    await profile_utils.addToWatchList(req.user, req.params.id);
    res.send("succes");
  }
  catch (err) {
    res.status(err.status || 500).send({ message: err.message || "bad", success: false });
  }
});

/**
 * add recipe to favorite 
 * @return success or err
 */
router.put("/favorite/add/:id", async (req, res, next) => {
  try {
    a = [];
    a.push(Number(req.params.id))
    r = await search_functions.getRecipesPreviewInfo(a);
    await profile_utils.addToFavorite(req.params.id, req.user);
    res.send("success");
  }
  catch (err) {
    next(err);
  }
});

/**
 * get my favorite recipes(pre-view)
 * @return @todo -change********
 */
router.get("/favorite", async (req, res) => {
  try {
    resul = await profile_utils.getMyFavorite(req.user);
    r = await search_functions.getRecipesPreviewInfo(resul);
    res.send(r);
  }
  catch (err) {
    next(err);
  }
});

/*
get recipe from  my recipe 
*/
router.get("/myRecipes", async (req, res, next) => {
  try {
    resul = await profile_utils.getMyRecipes(req.user,"my");
    res.send(JSON.stringify(resul));
  }
  catch (err) {
    next(err)
  }
});

/*
get recipe from  my family recipe 
*/
router.get("/familyRecipes", async (req, res, next) => {
  try {
    resul = await profile_utils.getMyRecipes(req.user,"family");
    res.send(JSON.stringify(resul));
  }
  catch (err) {
    next(err)
  }
});




router.post("/", function (req, res) {
  result = JSON.stringify(req.user_recupe_details);
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




router.use(function (err, req, res, next) {
  // console.error(err);
  res.status(err.status || 500).send({ message: err.message || "bad", success: false });
});


module.exports = router;
