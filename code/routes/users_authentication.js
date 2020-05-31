var express = require("express");
var router = express.Router();
const DButils = require("../modules/DButils");
const bcrypt = require("bcrypt");



//register
router.post("/Register", async (req, res, next) => {
    try {
      // parameters exists
      if(!req.body.username){
          throw { status: 401, message:"missinng username input"};
      }
      if(!req.body.password){
        throw { status: 401, message:"missinng password input"};
    }
      if(!req.body.first_name){
        throw { status: 401, message:"missinng first name input"};
    }
      if(!req.body.last_name){
        throw { status: 401, message:"missinng last name input"};
    }
    if(!req.body.country){
        throw { status: 401, message:"missinng country input"};
    }
    if(!req.body.email){
        throw { status: 401, message:"missinng email input"};
    }
    if(!req.body.profile_pic){
        throw { status: 401, message:"missinng profile picture input"};
    }

    //select all users
      const users = await DButils.execQuery("SELECT username FROM users");
  
    //encrypt the password
      if (users.find((x) => x.username === req.body.username))
        throw { status: 409, message: "Username taken" };
  
    // add the new username
      let hash_password = bcrypt.hashSync(
        req.body.password,
        parseInt(process.env.bcrypt_saltRounds)
      );
      await DButils.execQuery(
        `INSERT INTO users VALUES (default, '${req.body.username}', '${hash_password}' ,'${req.body.first_name}', '${req.body.last_name}', '${req.body.country}', '${req.body.email}', '${req.body.profile_pic}')`
      );
      res.status(201).send({ message: "user created", success: true });
    } catch (error) {
      next(error);
    }
  });
  

//login
  router.post("/Login", async (req, res, next) => {
    try {
      // check that username exists
      const users = await DButils.execQuery("SELECT username FROM users");
      if (!users.find((x) => x.username === req.body.username))
        throw { status: 401, message: "Username or Password incorrect" };
  
      // check that the password is correct
      const user = (
        await DButils.execQuery(
          `SELECT * FROM users WHERE username = '${req.body.username}'`
        )
      )[0];
  
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        throw { status: 401, message: "Username or Password incorrect" };
      }
  
      // Set cookie
      req.session.user_id = user.user_id;
      // req.session.save();
      // res.cookie(session_options.cookieName, user.user_id, cookies_options);
  
      // return cookie
      res.status(200).send({ message: "login succeeded", success: true });
    } catch (error) {
      next(error);
    }
  });
  
  router.post("/Logout", function (req, res) {
    req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
    res.send({ success: true, message: "logout succeeded" });
  });
  
  module.exports = router;
  