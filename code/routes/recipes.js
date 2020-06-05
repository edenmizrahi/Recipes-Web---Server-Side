
const express = require("express");
const router = express.Router();

const search_functions = require("../modules/search_recipes");

router.use((req, res, next) => {
    console.log("Recipes route");
    next();
});

//search for recipes -> return preview+instruction info
router.get("/search/query/:searchQuery/amount/:num", (req, res) => {
    try{
    if(req.params.num != 5 && req.params.num != 10 && req.params.num != 15 ){
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

    //search the recipe
    search_functions
        .searchForRecipes(search_params,"regular")
        .then((info_array) => res.send(info_array)) //return to the client the response 
        .catch((error) => {
            console.log(error);
            res.sendStatus(500);
        });
    }
    catch (err){
        next(err)
    }
});

//search for random recipes -> return preview info
router.get("/random", (req, res) => {
   
    search_params = {};
    search_params.number = 3;
    search_params.instructionsRequired = true;

    //search the recipe
    search_functions
        .searchForRecipes(search_params, "random")
        .then((info_array) => res.send(info_array)) //return to the client the response 
        .catch((error) => {
            console.log(error);
            res.sendStatus(500);
        });
});

//search for specific recipe -> return full info
router.get("/displayRecipePage/recipeId/:id", (req, res) => {
    // const 
    search_param = {};
    search_param.recipeId = req.params;

    //search the recipe
    search_functions
        .searchForSpecificRecipe(search_param, "full")
        .then((info_recipe) => res.send(info_recipe))
        .catch((error => {
            console.log(error);
            res.sendStatus(500);
        }));
});

//search for specific recipe -> return preview info
router.get("/displayPreviewRecipe/recipeId/:id", (req, res) => {
    // const 
    search_param = {};
    search_param.recipeId = req.params;

    //search the recipe
    search_functions
        .searchForSpecificRecipe(search_param, "preview")
        .then((info_recipe) => res.send(info_recipe))
        .catch((error => {
            console.log(error);
            res.sendStatus(500);
        }));
});

router.get("/analyzed/recipeId/:id", (req, res) => {
    // const 
    search_param = {};
    search_param.recipeId = req.params;

    //search the recipe
    search_functions
        .analyzedInstructions()
        .then((search_response) => res.send(search_response))
        .catch((error => {
            console.log(error);
            res.sendStatus(500);
        }));
});




module.exports = router;