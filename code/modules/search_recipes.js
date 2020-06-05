const axios = require("axios"); //support promises
// sponcular settings
const recipes_api_url = "https://api.spoonacular.com/recipes";
// A secret --> should be in .env file
const api_key = "apiKey=5f47b6a138ec48749d29c3a4da713d17";


function extractQueriesParams(query_params, search_params ){
    //Iterate on params list to identify only wanted params
    const params_list = ["diet", "cuisine", "intolerance"];
    params_list.forEach((param) => {
        if(query_params[param]){
            search_params[param] = query_params[param];
        }
    });
    console.log(search_params);
}

async function searchPrevieViewForSpecifisRecipe(search_param){
  let promises = [];

  // For each id  -> get promise of GET response
  
  promises.push(axios.get(`${recipes_api_url}/${search_param.recipe_id}/information?${api_key}`));

  let info_response1 = await Promise.all(promises);

  relevantRecipesData = previewViewData(info_response1);
  return relevantRecipesData;
}

async function searchForSpecificRecipe(search_param, param){
  // Get recipes info by id
  let info_array;

  if(param == "full"){
    info_array = await getRecipeInfo(search_param.recipeId, "full");
    console.log("Info_array: ", info_array);
  }
  else{
    info_array = await getRecipeInfo(search_param.recipeId, "preview");
    console.log("Info_array: ", info_array);
  }
  return info_array;
} 

//async function searchForRecipes(searchQuery, num, search_params){
async function searchForRecipes(search_params){
    let search_response = await axios.get(`${recipes_api_url}/search?${api_key}`, 
        {
          params: search_params,    
        }
    );

    const recipes_id_list = extractSearchResultsdIds(search_response);
    console.log(recipes_id_list);
    
    // Get recipes info by id
    let info_array = await getRecipesInfo(recipes_id_list, search_params);
    console.log("Info_array: ", info_array);
    
    return info_array;
}

async function searchForRandomRecipes(search_params){
  let search_response = await axios.get(`${recipes_api_url}/random?${api_key}`, 
      {
        params: search_params,    
      }
  );

  const recipes_id_list = extractSearchResultsIdsAfterRandom(search_response);
  console.log(recipes_id_list);
  
  // Get recipes info by id
  let info_array = await getRecipesPreviewInfo(recipes_id_list);
  console.log("Info_array: ", info_array);
  
  return info_array;
}

function extractSearchResultsIdsAfterRandom(search_response){
    let recipesBack = search_response.data.recipes;
    recipes_id_list = [];
    recipesBack.map((recipe) => {
        console.log(recipe.title);
        recipes_id_list.push(recipe.id);
    });
    return recipes_id_list;
}

function extractSearchResultsdIds(search_response){
  let recipesBack = search_response.data.results;
  recipes_id_list = [];
  recipesBack.map((recipe) => {
      console.log(recipe.title);
      recipes_id_list.push(recipe.id);
  });
  return recipes_id_list;
}

async function getRecipeInfo(recipe_id, param) {

  // For specific id -> get promise of GET response
  let info_response = await axios.get(`${recipes_api_url}/${recipe_id.id}/information?${api_key}`);

  // let info_response = await Promise.all(promises);
if(param == "full"){ 
  relevantRecipesData = fullViewData(info_response);
}
else{
  relevantRecipesData = previewViewDataForOneRecipe(info_response);
}
 
  return relevantRecipesData;
}

async function getRecipesPreviewInfo(recipes_id_list) {
  try{
  let promises = [];
  // For each id  -> get promise of GET response
  recipes_id_list.map((id) =>
    promises.push(axios.get(`${recipes_api_url}/${id}/information?${api_key}`))
  );
  let info_response1 = await Promise.all(promises);
  
  relevantRecipesData = previewViewData(info_response1);
  return relevantRecipesData;
  }
  catch(err){
    throw { status: 404, message: "recipe not found" };

  }
}


async function getRecipesPreviewInfoForProfile(recipes_id_list) {
  try{
  let promises = [];
  // For each id  -> get promise of GET response
  recipes_id_list.map((id) =>
    promises.push(axios.get(`${recipes_api_url}/${id}/information?${api_key}`))
  );
  let info_response1 = await Promise.all(promises);

  relevantRecipesData = previewViewDataForProfile(info_response1);
  return relevantRecipesData;
  }
  catch(err){
    throw { status: 404, message: "recipe not found" };

  }
}


async function getRecipesInfo(recipes_id_list, search_params) {
  let promises = [];

  // For each id  -> get promise of GET response
  recipes_id_list.map((id) =>
    promises.push(axios.get(`${recipes_api_url}/${id}/information?${api_key}`))
  );
  let info_response1 = await Promise.all(promises);

  relevantRecipesInstructionData = dataOfInstructions(info_response1);

  let array = [];
  relevantRecipesInstructionData.forEach((param) => {
    if(param.instructions != ""){
        array.push(param);
    }
  });

  if(array.length != recipes_id_list.length){
    searchForRecipes(search_params);
  }

  relevantRecipesData = previewViewDataIncludeInstruction(info_response1);
  return relevantRecipesData;
}

function dataOfInstructions(recipes_Info) {
  
  return recipes_Info.map((recipe_info) => {
    const {
      id,
      instructions,
    } = recipe_info.data;
  
    return {
      id: id,
      instructions: instructions,
    };
  });
}

function previewViewDataIncludeInstruction(recipes_Info) {
  
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
      instructions,
    } = recipe_info.data;

    var inside = {
      image: image,
      title: title,
      readyInMinutes: readyInMinutes,
      aggregateLikes: aggregateLikes,
      vegetarian: vegetarian,
      vegan: vegan,
      glutenFree: glutenFree,
      instructions: instructions,
    }
    
    var dic = {
      [id] : inside
    }
    return dic;
  });
}

function fullViewData(recipe_Info) {

    var inside = {
      image: recipe_Info.data.image,
      title: recipe_Info.data.title,
      readyInMinutes: recipe_Info.data.readyInMinutes,
      aggregateLikes: recipe_Info.data.aggregateLikes,
      vegetarian: recipe_Info.data.vegetarian,
      vegan: recipe_Info.data.vegan,
      glutenFree: recipe_Info.data.glutenFree,
      extendedIngredients: recipe_Info.data.extendedIngredients,
      instructions: recipe_Info.data.instructions,
      servings: recipe_Info.data.servings,
    };
    
    var dic = {
      [recipe_Info.data.id] : inside
    }

    return dic;
  
}

function previewViewDataForOneRecipe(recipe_Info){
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
    [recipe_Info.data.id] : inside
  }

  return dic;
}

function previewViewData(recipes_Info) {
  // let dic={};
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
      image: image,
      title: title,
      readyInMinutes: readyInMinutes,
      aggregateLikes: aggregateLikes,
      vegetarian: vegetarian,
      vegan: vegan,
      glutenFree: glutenFree,
    }
 
    // dic[id]=new Object();

    // dic[id].image= image;
    // dic[id].title= title;
    // dic[id].readyInMinutes=readyInMinutes
    // dic[id].aggregateLikes= aggregateLikes
    // dic[id].vegetarian= vegetarian;
    // dic[id].vegan= vegan;
    // dic[id].glutenFree= glutenFree;
    var dic = {
      [id] : inside
    }
    return dic;
  
  });
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
      recipe_id:id,
      image: image,
      title: title,
      readyInMinutes: readyInMinutes,
      aggregateLikes: aggregateLikes,
      vegetarian: vegetarian,
      vegan: vegan,
      glutenFree: glutenFree,
    }
    
   
    return inside;
  
  });
}

// async function promiseAll(func, param_list){
//     let promises = [];
//     param_list.map((param) => promises.push(func(param)));
//     let info_response = await Promise.all(promises);

//     return info_response;
// }
exports.getRecipesPreviewInfoForProfile = getRecipesPreviewInfoForProfile;

exports.getRecipesPreviewInfo = getRecipesPreviewInfo;
exports.getRecipesInfo = getRecipesInfo;
exports.searchForRecipes = searchForRecipes;
exports.searchForRandomRecipes = searchForRandomRecipes;
exports.extractQueriesParams = extractQueriesParams;
exports.searchForSpecificRecipe = searchForSpecificRecipe;
exports.searchPrevieViewForSpecifisRecipe = searchPrevieViewForSpecifisRecipe;