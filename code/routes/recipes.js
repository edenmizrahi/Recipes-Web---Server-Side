
const express = require("express");
const router = express.Router();

const search_functions = require("./help_functions/search_recipes");

router.use((req, res, next) => {
    console.log("Recipes route");
    next();
});

//routs
router.get("/search/query/:searchQuery/amount/:num", (req, res) => {
    
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
        .searchForRecipes(search_params)
        .then((info_array) => res.send(info_array)) //return to the client the response 
        .catch((error) => {
            console.log(error);
            res.sendStatus(500);
        });
});

router.get("/displayRecipePage/recipeId/:id", (req, res) => {
    // const 
    search_param = {};
    search_param.recipeId = req.params;

    //search the recipe
    search_functions
        .searchForSpecificRecipe(search_param, "full")
        .then((info_array) => res.send(info_array))
        .catch((error => {
            console.log(error);
            res.sendStatus(500);
        }));
});

router.get("/displayPreviewRecipe/recipeId/:id", (req, res) => {
    // const 
    search_param = {};
    search_param.recipeId = req.params;

    //search the recipe
    search_functions
        .searchForSpecificRecipe(search_param, "preview")
        .then((info_array) => res.send(info_array))
        .catch((error => {
            console.log(error);
            res.sendStatus(500);
        }));
});

router.get("/random/", (req, res) => {
   
    search_params = {};
    // search_params.query = searchQuery;
    search_params.number = 3;
    // search_params.instructionsRequired = true;

    //check if queries params exists
    // console.log(req.query);
    // search_functions.extractQueriesParams(req.query, search_params);

    //search the recipe
    search_functions
        .searchForRandomRecipes(search_params)
        .then((info_array) => res.send(info_array)) //return to the client the response 
        .catch((error) => {
            console.log(error);
            res.sendStatus(500);
        });
});

module.exports = router;