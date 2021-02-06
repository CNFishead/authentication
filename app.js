//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

//setup express
const app = express();

//Set view engine and language ejs
app.set('view engine', 'ejs');

//setup bodyParser and express to use public static folder
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//setup mongoose connection
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/userDB",
  {useNewUrlParser: true});

//setup a model, and schema
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
})


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
  });
app.get("/register", function(req, res){
    res.render("register");
  });
app.get("/login", function(req, res){
    res.render("login");
  });
app.post("/register", function(req, res){
  //create new user
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  //if no errors, save user, render the secrets page.
  newUser.save(function(err){
    if (err) {
      res.send(err)
    } else {
      res.render("secrets");
    }
  });
});
app.post("/login", function(req, res){
  //save the user and pass to be used as conditional statements
  const username = req.body.username;
  const password = req.body.password;
  //search userDB for any email matching username
  User.findOne({email: username}, function(err, user){
    if (err) {
      //IF any errors, log them
      console.log(err);
    }else {
      //IF a user has been found
      if (user) {
        //IF the User password is correct
        if (user.password === password) {
          //Render secrets page
          res.render("secrets");
        } else {
          //ELSE the passwords didnt match
          console.log('Wrong username or password. Please try again');
          res.render("login");
        }
      }
    }
  })

});



//Listen for server
app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
