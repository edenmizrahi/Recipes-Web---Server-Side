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
 * return object :{"45": object{watched :"false", favorite:"false"}} 
 */
router.get("/recipeInfo/:ids", async(req, res, next) => {
  try {
    const recipes_ids_list = JSON.parse(req.params.ids);
    r = await search_functions.getRecipesPreviewInfo(recipes_ids_list);
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
   @return array of 3 recipees priview view
*/
router.get("/watchedList/top", async (req, res,next) => {
  try {
    top = await profile_utils.getTopThree(req.user);
    r = await search_functions.getRecipesPreviewInfoForProfile(top);
    res.send(r);
  }
  catch (err) {
    next(err);
  }
});

/**
 * add $id to watch list of the user
 *  @return success or err
 */
router.put("/watchedList/add/:id", async (req, res) => {
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
 * get my favorites recipes(pre-view)
 * @return array of recipe priview view
 */
router.get("/favorite", async (req, res,next) => {
  try {
    resul = await profile_utils.getMyFavorite(req.user);
    r = await search_functions.getRecipesPreviewInfoForProfile(resul);
    res.send(r);
  }
  catch (err) {
    next(err);
  }
});

/*
* get alll recipes from  my recipe 
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

/**
 * get full details of my recipes 
 * @param recipes ids array for full details
 * @returns recipes full details
 */

router.get("/myRecipes/:ids", async (req, res, next) => {
  try {
    idaArray= JSON.parse(req.params.ids);
    promises=[];
    idaArray.map((id) => {
      promises.push(profile_utils.getPersonalRecipesFullDetails(req.user, id,"my"));
    }
  );
  result = await Promise.all(promises);
  res.send(JSON.stringify(result));
  }
  catch (err) {
    next(err)
  }
});


/**
 * get full details of my family recipe 
 * @param recipes ids array for full details
 * @returns recipes full details
 */

router.get("/familyRecipes/:ids", async (req, res, next) => {
  try {
    idaArray= JSON.parse(req.params.ids);
    promises=[];
    idaArray.map((id) => {
      promises.push(profile_utils.getPersonalRecipesFullDetails(req.user, id,"family"));
    }
  );
  result = await Promise.all(promises);
  res.send(JSON.stringify(result));
  }
  catch (err) {
    next(err)
  }
});





module.exports = router;
