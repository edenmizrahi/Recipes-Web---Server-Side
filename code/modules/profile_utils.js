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
    return recipes_Info.map((recipe_Info) => {
        console.log(recipe_Info);
        var inside = {
            "watched": recipe_Info.watched_in,
            "favorite": recipe_Info.favorite_in,
        }
        recipeID = recipe_Info.recipe_id;

        var dic = {
            [recipeID]: inside
        }
        return dic;

        // const{
        //     recipe_id,
        //     watched_in,
        //     favorite_in,
        // }=recipe_Info;

        // return{
        //     id: recipe_id,
        //     watched: watched_in,
        //     favorite: favorite_in,
        // };
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

    return result.map((res) => {
        // console.log(res);
        // const{
        //     recipe_id,

        // }=res;

        // return{
        //     id: recipe_id,

        // };
        return Number(recipe_Info.recipe_id);
    });

}

async function getMyRecipes(username) {
    recipes = await DButils.execQuery(`SELECT * FROM personalRecipes WHERE username='${username}'`);
    let recipesIds = recipes.map((res) => {
        console.log(res);
        const {
            recipe_id,

        } = res;

        return {
            id: recipe_id,
        };
    });
    res = await addIngrediants(recipesIds);
    console.log(res);
    return res;

}


async function addIngrediants(recipesIds) {
    //  id="123";
    // instructions=await DButils.execQuery(`SELECT * FROM instructions WHERE recipe_id='${id}'`);
    // generalINFO=await DButils.execQuery(`SELECT * FROM personalRecipes WHERE recipe_id='${id}'`);
    // ingredients=await DButils.execQuery(`SELECT * FROM ingredients WHERE recipe_id='${id}'`);
    console.log(recipesIds);
    promises = [];
    recipesIds.map((id_i) => {
        promises.push(getPersonalRecipesDetails(id_i.id));
    }
    );
    res = await Promise.all(promises);
    console.log(res);
    return res;

    // return  await Promise.all (recipesIds.map( async (id_i)=> await getPersonalRecipesDetails(id_i)));
}
asyn
async function getPersonalRecipesDetails(rid) {
    // id=id_i.id;
    // console.log(id);

    let instructions = await DButils.execQuery(`SELECT * FROM instructions WHERE recipe_id='${rid}'`);
    let generalINFO = await DButils.execQuery(`SELECT * FROM personalRecipes WHERE recipe_id='${rid}'`);
    let ingredients = await DButils.execQuery(`SELECT * FROM ingredients WHERE recipe_id='${rid}'`);

    console.log("id is: " + rid);
    console.log(ingredients);
    let ingredientsOfRec = await ingredients.map((ing) => {
        console.log(ing);
        let ingredientsOfRec = {
            [ing.ingredient]: ing.amount
        }
        return ingredientsOfRec;
    });
    console.log(ingredientsOfRec);

    let instructionsOfRec = instructions.map((ins) => {
        let instructionsOfRec = {
            [ins.num]: ins.content
        }
        return instructionsOfRec;
    });
    console.log(instructionsOfRec);
    console.log(generalINFO.title);
    console.log("id is: " + generalINFO[0].recipe_id);
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
    console.log("res is:" + res + " res id: " + generalINFO[0].recipe_id);
    return { [generalINFO[0].recipe_id]: res };
}
exports.getMyRecipes = getMyRecipes;
exports.getTopThree = getTopThree;
exports.addToWatchList = addToWatchList;
exports.getMyFavorite = getMyFavorite;
exports.addToFavorite = addToFavorite;
exports.getRecipeProfileInfo = getRecipeProfileInfo;


