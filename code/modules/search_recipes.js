const axios = require("axios"); //support promises
// sponcular settings
const recipes_api_url = "https://api.spoonacular.com/recipes";
// A secret --> should be in .env file
const api_key = "apiKey=4f9444f80338423aac1d613bc207564c";
// const api_key = "apiKey=cac138d6087c4411b1c42232e6689678";
// const api_key = "apiKey=9dfadfa642a74094836f8a3d38d80db2";
const profile_utils = require("./profile_utils");
const DButils = require("./DButils");

// update params of diet, cuisine and intolerance
function extractQueriesParams(query_params, search_params) {
  //Iterate on params list to identify only wanted params
  const params_list = ["diet", "cuisine", "intolerance"];
  params_list.forEach((param) => {
    if (query_params[param]) {
      search_params[param] = query_params[param];
    }
  });
  console.log(search_params);
}

// async function that search after one recipe and return full/preview view, according to "param"
async function searchForSpecificRecipe(search_param, param, req) {
  try {
    // Get recipes info by id
    let info_recipe;

    if (param == "full") {
      info_recipe = await getRecipeInfo(search_param.recipeId, "full", req);
      console.log("Info_array: ", info_recipe);
    } else {
      info_recipe = await getRecipeInfo(search_param.recipeId, "preview", req);
      console.log("Info_array: ", info_recipe);
    }
    return info_recipe;
  } catch (err) {
    throw { status: 404, message: "No reciepes found for the search params." };
  }
}

// async function analyzedInstructions() {
//   let search_response = axios.get(
//     `${recipes_api_url}/${id}/analyzedInstructions?${api_key}`
//   );
//   return search_response;
// }

// async function that search recipes and return full/preview view, according to "randomOrNot"
async function searchForRecipes(search_params, randomOrNot) {
  try {
    let search_response;

    if (randomOrNot == "regular") {
      search_response = await axios.get(
        `${recipes_api_url}/search?${api_key}`,
        {
          params: search_params,
        }
      );
    } else {
      search_response = await axios.get(
        `${recipes_api_url}/random?${api_key}`,
        {
          params: search_params,
        }
      );
    }

    const recipes_id_list = extractSearchResultsdIds(
      search_response,
      randomOrNot
    );

    console.log(recipes_id_list);

    if (recipes_id_list.length == 0) {
      throw {
        status: 404,
        message: "recipe not found at api",
      };
    }

    // Get recipes info by id
    let info_array = await getRecipesInfo(
      recipes_id_list,
      search_params,
      randomOrNot
    );
    console.log("Info_array: ", info_array);

    return info_array;
  } catch (err) {
    // next(err);
    throw {
      status: err.status || 404,
      message: err.message || "recipe not found at api",
    };
  }
}

// function that return list of recipes id's
function extractSearchResultsdIds(search_response, randomOrNot) {
  try {
    let recipesBack;
    if (randomOrNot == "random") {
      recipesBack = search_response.data.recipes;
    } else {
      recipesBack = search_response.data.results;
    }
    recipes_id_list = [];
    recipesBack.map((recipe) => {
      console.log(recipe.title);
      recipes_id_list.push(recipe.id);
    });
    return recipes_id_list;
  } catch (err) {
    throw { status: 404, message: "recipe not found at api" };
  }
}

// async function that return info about one recipe - full/preview according to "param"
async function getRecipeInfo(recipe_id, param, req) {
  try {
    // For specific id -> get promise of GET response
    let info_response = await axios.get(
      `${recipes_api_url}/${recipe_id.id}/information?${api_key}`
    );

    // let info_response = await Promise.all(promises);
    if (param == "full") {
      relevantRecipesData = fullViewData(info_response, req);
    } else {
      relevantRecipesData = previewViewDataForOneRecipe(info_response);
    }

    return relevantRecipesData;
  } catch (err) {
    throw { status: 404, message: "recipe not found at api" };
  }
}

// async function that return preview info about the recipes ids
async function getRecipesPreviewInfo(recipes_id_list) {
  try {
    let promises = [];
    // For each id  -> get promise of GET response
    recipes_id_list.map((id) =>
      promises.push(
        axios.get(`${recipes_api_url}/${id}/information?${api_key}`)
      )
    );
    let info_response1 = await Promise.all(promises);

    relevantRecipesData = previewViewData(info_response1);
    return relevantRecipesData;
  } catch (err) {
    throw { status: 404, message: "recipe not found at api" };
  }
}

async function getRecipesPreviewInfoForProfile(recipes_id_list) {
  try {
    let promises = [];
    // For each id  -> get promise of GET response
    recipes_id_list.map((id) =>
      promises.push(
        axios.get(`${recipes_api_url}/${id}/information?${api_key}`)
      )
    );
    let info_response1 = await Promise.all(promises);

    relevantRecipesData = previewViewDataForProfile(info_response1);
    return relevantRecipesData;
  } catch (err) {
    throw { status: 404, message: "recipe not found" };
  }
}

// async function that return info about the recipes - full/preview according to "randomOrNot"
async function getRecipesInfo(recipes_id_list, search_params, randomOrNot) {
  try {
    let promises = [];
    // For each id  -> get promise of GET response
    recipes_id_list.map((id) =>
      promises.push(
        axios.get(`${recipes_api_url}/${id}/information?${api_key}`)
      )
    );
    let info_response = await Promise.all(promises);
    // check if all the recipes have instructions
    let relevantRecipesInstructionData = dataOfInstructions(info_response);
    let array = [];
    relevantRecipesInstructionData.forEach((param) => {
      if (param.instructions != "") {
        array.push(param);
      }
    });

    // if not - search again
    if (array.length != recipes_id_list.length && randomOrNot == "random") {
      await searchForRecipes(search_params, randomOrNot);
    }

    let relevantRecipesData;
    if (randomOrNot == "random") {
      relevantRecipesData = previewViewData(info_response);
    } else {
      relevantRecipesData = previewViewDataIncludeInstruction(info_response);
    }
    return relevantRecipesData;
  } catch (error) {
    throw { status: 404, message: "recipe not found at api" };
  }
}

// function that return info (id and instruction fields) about the recipes
function dataOfInstructions(recipes_Info) {
  try {
    let array = [];
    // if (recipes_Info.length > 1) {
    recipes_Info.map((recipe_info) => {
      let cell = new Object();
      cell.id = recipe_info.data.id;
      cell.instructions = recipe_info.data.instructions;
      array.push(cell);
    });

    return array;
  } catch (err) {
    throw { status: 404, message: "recipe not found at api" };
  }
}

//split the instructions field into array
function SplitInstructions(instructionData) {
  try {
    let record = instructionData[0].steps;
    let arrayOfInstructions = [];
    record.map((step) => {
      let cell = new Object();
      cell.number = step.number;
      cell.step = step.step;
      arrayOfInstructions.push(cell);
    });

    return arrayOfInstructions;
  } catch (err) {
    throw { status: 404, message: "recipe not found at api" };
  }
}

//split the ingredients field into array
function SplitIngredients(ingredientsData) {
  try {
    // let record = ingredientsData[0].steps;
    let arrayOfIngredients = [];
    ingredientsData.map((step) => {
      let cell = new Object();
      cell.name = step.name;
      cell.amount = step.amount;
      cell.unit = step.unit;
      arrayOfIngredients.push(cell);
    });
    return arrayOfIngredients;
  } catch (err) {
    throw { status: 404, message: "recipe not found at api" };
  }
}

// function that return info about the recipes - preview info + instructions
function previewViewDataIncludeInstruction(recipes_Info) {
  try {
    let dic = {};
    recipes_Info.map((recipe_info) => {
      let instructions = "";
      if (recipe_info.data.instructions != "") {
        instructions = SplitInstructions(recipe_info.data.analyzedInstructions);
      }

      var inside = {
        image: recipe_info.data.image,
        title: recipe_info.data.title,
        readyInMinutes: recipe_info.data.readyInMinutes,
        aggregateLikes: recipe_info.data.aggregateLikes,
        vegetarian: recipe_info.data.vegetarian,
        vegan: recipe_info.data.vegan,
        glutenFree: recipe_info.data.glutenFree,
        instructions: instructions,
        // cuisine: recipe_info.data.cuisines,
      };

      var recipeId = recipe_info.data.id;
      dic[recipeId] = new Object();
      dic[recipeId] = inside;
    });
    return dic;
  } catch (err) {
    throw {
      status: err.status || 404,
      message: err.message || "recipe not found at api",
    };
  }
}

// function that return full info about one recipe
function fullViewData(recipe_Info, req) {
  try {
    DButils.execQuery("SELECT * FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        user = users.find((x) => x.user_id === req.session.user_id);
        username = user.username;
        profile_utils.addToWatchList(username, recipe_Info.data.id);
      }
    });

    let dic = {};

    let instructions = "";
    if (recipe_Info.data.instructions != "") {
      instructions = SplitInstructions(recipe_Info.data.analyzedInstructions);
    }
    let ingredients = "";
    if (recipe_Info.data.extendedIngredients.length > 0) {
      ingredients = SplitIngredients(recipe_Info.data.extendedIngredients);
    }

    var inside = {
      image: recipe_Info.data.image,
      title: recipe_Info.data.title,
      readyInMinutes: recipe_Info.data.readyInMinutes,
      aggregateLikes: recipe_Info.data.aggregateLikes,
      vegetarian: recipe_Info.data.vegetarian,
      vegan: recipe_Info.data.vegan,
      glutenFree: recipe_Info.data.glutenFree,
      ingredients: ingredients,
      instructions: instructions,
      servings: recipe_Info.data.servings,
    };

    var recipeId = recipe_Info.data.id;
    dic[recipeId] = new Object();
    dic[recipeId] = inside;
    return dic;
  } catch (err) {
    throw {
      status: err.status || 404,
      message: err.message || "recipe not found at api",
    };
  }
}

// function that return priview info about one recipe
function previewViewDataForOneRecipe(recipe_Info) {
  // let dic = {};
  var inside = {
    image: recipe_Info.data.image,
    title: recipe_Info.data.title,
    readyInMinutes: recipe_Info.data.readyInMinutes,
    aggregateLikes: recipe_Info.data.aggregateLikes,
    vegetarian: recipe_Info.data.vegetarian,
    vegan: recipe_Info.data.vegan,
    glutenFree: recipe_Info.data.glutenFree,
  };

  var dic = {
    [recipe_Info.data.id]: inside,
  };

  // var recipeId = recipe_info.data.id;
  // dic[recipeId] = new Object();
  // dic[recipeId] = inside;

  return dic;
}

// function that return priview info about the recipes
function previewViewData(recipes_Info) {
  let dic = {};
  recipes_Info.map((recipe_info) => {
    const {
      image,
      title,
      readyInMinutes,
      aggregateLikes,
      vegetarian,
      vegan,
      glutenFree,
    } = recipe_info.data;

    var inside = {
      image: image,
      title: title,
      readyInMinutes: readyInMinutes,
      aggregateLikes: aggregateLikes,
      vegetarian: vegetarian,
      vegan: vegan,
      glutenFree: glutenFree,
    };

    var recipeId = recipe_info.data.id;
    dic[recipeId] = new Object();
    dic[recipeId] = inside;

    // return { [recipeId]: inside };
  });
  return dic;
}

function previewViewDataForProfile(recipes_Info) {
  return recipes_Info.map((recipe_info) => {
    const {
      id,
      image,
      title,
      readyInMinutes,
      aggregateLikes,
      vegetarian,
      vegan,
      glutenFree,
    } = recipe_info.data;

    var inside = {
      recipe_id: id,
      image: image,
      title: title,
      readyInMinutes: readyInMinutes,
      aggregateLikes: aggregateLikes,
      vegetarian: vegetarian,
      vegan: vegan,
      glutenFree: glutenFree,
    };

    return inside;
  });
}

exports.getRecipesPreviewInfoForProfile = getRecipesPreviewInfoForProfile;
exports.getRecipesPreviewInfo = getRecipesPreviewInfo;
exports.getRecipesInfo = getRecipesInfo;
exports.searchForRecipes = searchForRecipes;
exports.extractQueriesParams = extractQueriesParams;
exports.searchForSpecificRecipe = searchForSpecificRecipe;
// exports.analyzedInstructions = analyzedInstructions;
