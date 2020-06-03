var express = require("express");
var router = express.Router();
const DButils = require("./DButils");
const bcrypt = require("bcrypt");
const search_functions = require("../modules/search_recipes");



async function getRecipeProfileInfo(username, recipes_ids_list) {
    try {
        promises = [];
        recipes_ids_list.map((id) =>
            promises.push(getProfileInfoRcipes(id, username))
        );
        let info_response1 = await Promise.all(promises);
        return relevantData(info_response1);
    }
    catch (err) {
        throw { status: 404, message: "recipe not found" };
    }
}


function relevantData(recipes_Info) {
    let dic={};
    return recipes_Info.map((recipe_Info) => {
        console.log(recipe_Info);
        var recipeID = recipe_Info.recipe_id;
        dic[recipeID]=new Object();
        dic[recipeID].watched= recipe_Info.watched_in==0?false:true;
        dic[recipeID].favorite= recipe_Info.favorite_in==0?false:true;
        return dic;
    });
}
async function getProfileInfoRcipes(id, username) {
    users = await DButils.execQuery("SELECT * FROM users_recipes");

    if (users.find((x) => x.username === username && x.recipe_id == id)) {
        user_recipe_details = await DButils.execQuery(`SELECT * FROM users_recipes WHERE username='${username}' AND recipe_id='${id}'`);
        return user_recipe_details[0];
    }
    else {
        newId = await getNextId();
        await DButils.execQuery(`INSERT INTO users_recipes VALUES ('${newId}', '${username}', '${id}' ,0, 0)`);
        user_recipe_details = await DButils.execQuery(`SELECT * FROM users_recipes WHERE username='${username}' AND recipe_id='${id}'`);
        return user_recipe_details[0];
    }
}

async function getNextId() {
    maxID = await DButils.execQuery(`SELECT Max(id) as max
        FROM users_recipes;`);
    let newId = 0;
    if (maxID[0].max == null) {
        newId = 1;
    }
    else {
        naxint = JSON.parse(maxID[0].max);
        newId = naxint + 1;
    }
    return "" + newId;
}

async function addToFavorite(id, username) {
    users = await DButils.execQuery("SELECT * FROM users_recipes");

    if (users.find((x) => x.username === username && x.recipe_id == id)) {
        user_recipe_details = await DButils.execQuery(`UPDATE users_recipes SET favorite_in = '1' WHERE username='${username}' AND recipe_id='${id}'`);
    }
    else {
        newId = await getNextId();
        await DButils.execQuery(`INSERT INTO users_recipes VALUES ('${newId}', '${username}', '${id}' ,0, 1)`);
    }
}

async function getMyFavorite(username) {
    users = await DButils.execQuery("SELECT * FROM users_recipes");
    if (users.find((x) => x.username === username)) {
        user_recipe_details = await DButils.execQuery(`SELECT * FROM users_recipes WHERE username='${username}' and favorite_in='1'`);
        recipes_Info = user_recipe_details;
        console.log(recipes_Info);

        return recipes_Info.map((recipe_Info) => {
            console.log(recipe_Info.recipe_id);
            // const{
            //     recipe_id,

            // }=recipe_Info;

            // return{
            //     id: recipe_id,

            // };

            return Number(recipe_Info.recipe_id);
        });
    }
    else {
        return [];
    }

}

async function addToWatchList(username, id) {
    users = await DButils.execQuery("SELECT * FROM users_recipes");
    if (users.find((x) => x.username === username && x.recipe_id == id)) {
        newId = await getNextId();
        console.log(newId);
        user_recipe_details = await DButils.execQuery(`UPDATE users_recipes SET  id= '${newId}', watched_is='1' WHERE username='${username}' AND recipe_id='${id}'`);
    }
    else {
        newId = await getNextId();
        await DButils.execQuery(`INSERT INTO users_recipes VALUES ('${newId}', '${username}', '${id}' ,1, 0)`);
    }
}

async function getTopThree(username) {
    let result = await DButils.execQuery(`SELECT  TOP (3) *
    FROM users_recipes WHERE username='${username}'
    ORDER BY [id] DESC;`);
    console.log(result);

    return result.map((rec) => {
        // console.log(res);
        // const{
        //     recipe_id,

        // }=res;

        // return{
        //     id: recipe_id,

        // };
        return Number(rec.recipe_id);
    });

}

async function getMyRecipes(username,familyOrMy) {
    recipes = await DButils.execQuery(`SELECT * FROM personalRecipes WHERE (username='${username}' and type= '${familyOrMy}')`);
    let recipesIds = recipes.map((res) => {
        console.log(res);
        const {
            recipe_id,

        } = res;

        return {
            id: recipe_id,
        };
    });
    res = await addIngrediants(recipesIds,familyOrMy);
    console.log(res);
    return res;

}

async function addIngrediants(recipesIds,familyOrMy) {
    console.log(recipesIds);
    promises = [];
    recipesIds.map((id_i) => {
        promises.push(getPersonalRecipesDetails(id_i.id,familyOrMy));
    }
    );
    res = await Promise.all(promises);
    console.log(res);
    return res;

    // return  await Promise.all (recipesIds.map( async (id_i)=> await getPersonalRecipesDetails(id_i)));
}

async function getPersonalRecipesDetails(rid,familyOrMy) {
    // id=id_i.id;
    // console.log(id);

    let instructions = await DButils.execQuery(`SELECT * FROM instructions WHERE recipe_id='${rid}'`);
    let generalINFO = await DButils.execQuery(`SELECT * FROM personalRecipes WHERE recipe_id='${rid}'`);
    let ingredients = await DButils.execQuery(`SELECT * FROM ingredients WHERE recipe_id='${rid}'`);
    let dic={};
    console.log("id is: " + rid);
    console.log(ingredients);
    let ingredientsOfRec = await ingredients.map((ing) => {
        // dic[ing.ingredient]=new Object();
        // dic[ing.ingredient].amount= ing.amount

        // console.log(ing);
        // let ingredientsOfRec = {
        //     [ing.ingredient]: ing.amount
        // }
        // return ingredientsOfRec;

        // return dic
        return {[ing.ingredient]: ing.amount};
    });
    console.log(ingredientsOfRec);

    let instructionsOfRec = instructions.map((ins) => {
        // let instructionsOfRec = {
        //     [ins.num]: ins.content
        // }
        // return {instructionsOfRec};
        return {[ins.num]: ins.content};
    });
    console.log(instructionsOfRec);
    console.log(generalINFO.title);
    console.log("id is: " + generalINFO[0].recipe_id);
    
    
    if(familyOrMy=="family"){
        let familyInfo = await DButils.execQuery(`SELECT * FROM familyRecipes WHERE recipe_id='${rid}'`);
        let pictures = await DButils.execQuery(`SELECT * FROM picturesRecipes WHERE recipe_id='${rid}'`);
        let picturesOfRec = pictures.map((pic) => {
            // const{
            //     pic.picture,

            // }=pictures;

            // return{
            //     picture,
            // };
            return pic.picture;
            // let instructionsOfRec = {
            //     [ins.num]: ins.content
            // }
            // return instructionsOfRec;
        });

        let res = {
            "title": generalINFO[0].title,
            "owner": familyInfo[0].owner,
            "when": familyInfo[0].when,
            "pictures": picturesOfRec,
            "image": generalINFO[0].image,
            "duration": generalINFO[0].duration,
            "vegetarians": generalINFO[0].Vegetarians,
            "vegan": generalINFO[0].Vegan,
            "glutenFree": generalINFO[0].glutenFree,
            "ingredients": ingredientsOfRec,
            "instrauctions": instructionsOfRec,
        }
        return { [generalINFO[0].recipe_id]: res };

    }
    else{
    let res = {
        "title": generalINFO[0].title,
        "image": generalINFO[0].image,
        "duration": generalINFO[0].duration,
        "vegetarians": generalINFO[0].Vegetarians,
        "vegan": generalINFO[0].Vegan,
        "glutenFree": generalINFO[0].glutenFree,
        "ingredients": ingredientsOfRec,
        "instrauctions": instructionsOfRec,
    }
    return { [generalINFO[0].recipe_id]: res };
    }
    // console.log("res is:" + res + " res id: " + generalINFO[0].recipe_id);
}
exports.getMyRecipes = getMyRecipes;
exports.getTopThree = getTopThree;
exports.addToWatchList = addToWatchList;
exports.getMyFavorite = getMyFavorite;
exports.addToFavorite = addToFavorite;
exports.getRecipeProfileInfo = getRecipeProfileInfo;


