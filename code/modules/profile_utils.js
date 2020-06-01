var express = require("express");
var router = express.Router();
const DButils = require("./DButils");
const bcrypt = require("bcrypt");


async function getRecipeProfileInfo(username,recipes_ids_list){
    promises=[];
    recipes_ids_list.map((id)=>
    promises.push(getProfileInfoRcipes(id,username))
    );
    let info_response1= await Promise.all(promises);
    return relevantData(info_response1);
}

function relevantData(recipes_Info){
    return recipes_Info.map((recipe_Info)=>{
        console.log(recipe_Info);
        const{
            recipe_id,
            watched_in,
            favorite_in,
        }=recipe_Info;

        return{
            id: recipe_id,
            watched: watched_in,
            favorite: favorite_in,
        };
    });
}
async function getProfileInfoRcipes(id,username){
    users = await DButils.execQuery("SELECT * FROM users_recipes");
    console.log(users[0].username+"=="+username);
    console.log(users[0].recipe_id+"=="+id);

    if (users.find((x) => x.username === username && x.recipe_id == id)){
        user_recipe_details=await DButils.execQuery(`SELECT * FROM users_recipes WHERE username='${username}' AND recipe_id='${id}'`);
            return user_recipe_details[0];
    }
else{
        await DButils.execQuery(`INSERT INTO users_recipes VALUES ('${username}', '${id}' ,0, 0)`);
        user_recipe_details=await DButils.execQuery(`SELECT * FROM users_recipes WHERE username='${username}' AND recipe_id='${id}'`);
        return user_recipe_details[0];
    }
}

exports.getRecipeProfileInfo=getRecipeProfileInfo;


