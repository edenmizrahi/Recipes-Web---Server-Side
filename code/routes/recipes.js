const express = require("express");
const router = express.Router();

const search_functions = require("../modules/search_recipes");

router.use((req, res, next) => {
  console.log("Recipes route");
  next();
});

//search for recipes -> return preview+instruction info
router.get("/search/query/:searchQuery/amount/:num", async (req, res, next) => {
  try {
    if (req.params.num != 5 && req.params.num != 10 && req.params.num != 15) {
      req.params.num = 5;
    }

    const { searchQuery, num } = req.params;
    search_params = {};
    search_params.query = searchQuery;
    search_params.number = num;
    search_params.instructionsRequired = true;

    //check if queries params exists
    console.log(req.query);
    search_functions.extractQueriesParams(req.query, search_params);

    info_array = await search_functions.searchForRecipes(
      search_params,
      "regular"
    );
    res.send(info_array);

    // search the recipe
    // search_functions
    //   .searchForRecipes(search_params, "regular")
    //   .then((info_array) => res.send(info_array)) //return to the client the response
    //   .catch((error) => {
    //     console.log(error);
    //     // res.sendStatus(500);
    //     throw { status: error.status, message: error.message };
    //   });
  } catch (err) {
    res
      .status(err.status || 500)
      .send({ message: err.message || "bad", status: err.status });
  }
});

//search for random recipes -> return preview info
router.get("/random", async (req, res) => {
  try {
    search_params = {};
    search_params.number = 3;
    search_params.instructionsRequired = true;

    //search the recipe
    info_array = await search_functions.searchForRecipes(
      search_params,
      "random"
    );
    res.send(info_array);
    // search_functions
    //   .searchForRecipes(search_params, "random")
    //   .then((info_array) => res.send(info_array)) //return to the client the response
    //   .catch((error) => {
    //     console.log(error);
    //     res.send(error.message);
    //     //   res.status(error.status || 500).send({ message: error.message });
    //   });
  } catch (err) {
    res
      .status(err.status || 500)
      .send({ message: err.message || "bad", status: err.status });
  }
});

//search for specific recipe -> return full info
router.get("/displayRecipePage/recipeId/:id", async (req, res) => {
  try {
    search_param = {};
    search_param.recipeId = req.params;

    //search the recipe
    info_recipe = await search_functions.searchForSpecificRecipe(
      search_param,
      "full",
      req
    );
    res.send(info_recipe);
    // search_functions
    //   .searchForSpecificRecipe(search_param, "full", req)
    //   .then((info_recipe) => res.send(info_recipe))
    //   .catch((error) => {
    //     console.log(error);
    //     res.sendStatus(500);
    //   });
  } catch (err) {
    res
      .status(err.status || 500)
      .send({ message: err.message || "bad", status: err.status });
  }
});

//search for specific recipe -> return preview info
router.get("/displayPreviewRecipe/recipeId/:id", async (req, res) => {
  try {
    search_param = {};
    search_param.recipeId = req.params;

    //search the recipe
    info_recipe = await search_functions.searchForSpecificRecipe(
      search_param,
      "preview",
      req
    );
    info_recipe = res.send(info_recipe);
    // search_functions
    //   .searchForSpecificRecipe(search_param, "preview", req)
    //   .then((info_recipe) => res.send(info_recipe))
    //   .catch((error) => {
    //     console.log(error);
    //     res.sendStatus(500);
    //   });
  } catch (err) {
    res
      .status(err.status || 500)
      .send({ message: err.message || "bad", status: err.status });
  }
});

// router.get("/analyzed/recipeId/:id", (req, res) => {
//     // const
//     search_param = {};
//     search_param.recipeId = req.params;

//     //search the recipe
//     search_functions
//         .analyzedInstructions()
//         .then((search_response) => res.send(search_response))
//         .catch((error => {
//             console.log(error);
//             res.sendStatus(500);
//         }));
// });

module.exports = router;
