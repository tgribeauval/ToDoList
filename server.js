"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
const listRoutes = require("./routes/mylist");

const categoryFunc = require('./cateFunction');
const apiFunctions = require('./apiFunctions')
const session     = require("express-session");
const bcrypt      = require('bcrypt-nodejs');
const cookieParser = require('cookie-parser');

//Require API functions

const fetch = require('node-fetch');
const yelp = require('yelp-fusion');
const ebay = require('ebay-api');


//Allows to use cookie session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge:24 * 60 * 60 * 1000}
  //store: connect to storesession in database?
}));


// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));

app.use("/mylist", listRoutes(knex));




app.get("/", (req, res) => {
  if(req.session.user_id === undefined){
    res.redirect('/login')
    return;
  }else{
    knex("users")
    .where("id", req.session.user_id)
    .then((users) => {
      if (users[0].id === null) {
        res.redirect("/login");
      } else {
         res.render("index");
      }
    })
  }
});

//get for /login

app.get("/login", (req, res) => {

  return res.status(200).render("login");

});



//post for login
 app.post("/login", (req, res) => {

   let email = req.body.email;

  knex("users")
    .where("email", req.body.email)
    .then((users) => {
      if(users.length !== 0) {
        let password = users[0].password;
        let checkedPassword = bcrypt.compareSync(req.body.password, password);
        if (checkedPassword) {
          req.session.user_id = users[0].id;
          res.redirect("/");
        }
      } else {
        res.redirect('/login');
      }
    });
  });

//post for register

app.post("/register",(req,res)=>{
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);

  if(!req.body.email || !req.body.password){
    console.log("no data")
    return res.redirect('/login')
  }

  knex.select().table('users').where({'email': req.body.email})
  .then((result)=>{
      if (result.length > 1){
        console.log(result)
        return res.redirect('/')
      }
      else{
         knex("users")
        .returning("id")
        .insert({
         email: req.body.email,
         password: hash
        })
        .then((userid) => {
          console.log("Get Here NE ")
          req.session.user_id = userid[0];
          return res.redirect("/mylist");
        });
      }


  })



})
//get for profile page

app.get("/profile", (req, res) => {

   const templateVars = {
    id: req.session.user_id
   };

   console.log(templateVars);

  res.status(200).render("profile", templateVars);

});

app.post("/profile/:id", (req, res) => {

  const updatedEmail = req.body.email

  const salt = bcrypt.genSaltSync(10);
  const updatedPassword = bcrypt.hashSync(req.body.password, salt);

  knex
    ("users")
    .where("id", Number(req.params.id))
    .update({
      email: updatedEmail,
      password: updatedPassword
    })
    .then((id) => {

      res.status(301).redirect("/");
    });

});

app.post("/profile/:id/delete", (req, res) => {

  knex
    ("users")
    .del()
    .where("email", req.body.email)
    // console.log("Email", email)
    // console.log("password", password)
    // console.log("RBE", req.body.email)
    //   console.log("RBP", req.body.password)

    .then((users) => {

    res.status(301).redirect("/login");

  });
});


//post for logout

app.post("/logout", (req, res) => {

  req.session.destroy();
  res.status(301).redirect('/login');
});





app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
