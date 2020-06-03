var express = require("express");
var router = express.Router();
const DButils = require("../modules/DButils");
const bcrypt = require("bcrypt");
const auth_util=require("../modules/auth_utils")


//register
router.post("/Register", async (req, res, next) => {
    try {
      // parameters exists
      ex_message=auth_util.registrationMissingParam(req.body);
      if(ex_message!=""){
        next({ status: 401, message:ex_message});
      }
      const users = await auth_util.getUsersFronDB();
      await auth_util.addNewUser(req,users)
      res.status(201).send({ message: "user created", success: true });
    } catch (error) {
      next(error);
    }
  });
  

//login
  router.post("/Login", async (req, res, next) => {
    try {
      const users = await auth_util.getUsersFronDB();
      user= await auth_util.login(users, req);
      req.session.user_id = user.user_id;
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
  