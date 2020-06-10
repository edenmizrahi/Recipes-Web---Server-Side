var express = require("express");
var router = express.Router();
const DButils = require("./DButils");
const bcrypt = require("bcrypt");




function registrationMissingParam(body){
    if(!body.username){
        return "missinng username input";
      }
      if(!body.password){
       return "missinng password input";
    }
      if(!body.first_name){
       return "missinng first name input";
    }
      if(!body.last_name){
       return "missinng last name input";
    }
    if(!body.country){
      return "missinng country input";
    }
    if(!body.email){
      return "missinng email input";
    }
    if(!body.profile_pic){
        return "missinng profile picture input";
    }
    return "";
}

async function getUsersFronDB(){
   users= await DButils.execQuery("SELECT username FROM users");
   return users;
}

async function addNewUser(req,users){
    if (users.find((x) => x.username === req.body.username))
    throw { status: 409, message: "Username already taken" };

// encrypt password
  let hash_password = bcrypt.hashSync(
    req.body.password,
    parseInt(process.env.bcrypt_saltRounds)
  );
  //add user to db
  await DButils.execQuery(
    `INSERT INTO users VALUES (default, '${req.body.username}', '${hash_password}' ,'${req.body.first_name}', '${req.body.last_name}', '${req.body.country}', '${req.body.email}', '${req.body.profile_pic}')`
  );
}

async function login(users,req){
    if (!users.find((x) => x.username === req.body.username))
        throw { status: 401, message: "Username or Password incorrect" };

    const user = (
        await DButils.execQuery(
       `SELECT * FROM users WHERE username = '${req.body.username}'`
    )
  )[0];
  let hash_password =await bcrypt.hashSync(
    req.body.password,
    parseInt(process.env.bcrypt_saltRounds)
  );
    if (!await bcrypt.compareSync(req.body.password, user.password)) {
        throw { status: 401, message: "Username or Password incorrect" };
    }
    return user;
       
}


exports.registrationMissingParam=registrationMissingParam;
exports.getUsersFronDB=getUsersFronDB;
exports.login=login;
exports.addNewUser=addNewUser;
