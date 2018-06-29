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


const session     = require("express-session");
const bcrypt      = require('bcrypt-nodejs');

//Allows to use cookie session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 60000}
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

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

//get for /login

app.get("/login", (req, res) => {

  res.status(200).render("login");

});

//post for login
 app.post("/login", (req, res) => {

   let email = req.body.email;

  knex("users")
    .where("email", req.body.email)
    .then((users) => {

      if(users) {
        let password = users[0].password;
        let checkedPassword = bcrypt.compareSync(req.body.password, password);
        if (checkedPassword) {
          req.session.user_id = users[0].id;
          console.log("cookie",req.session)
          console.log("users", users)
          res.render("index");
        }
      } else {
        res.redirect('/login');
      }
    });
  });

//post for register

app.post("/register", (req, res) => {
​
 // if (req.body.email && req.body.password) {
   const salt = bcrypt.genSaltSync(10);
   const hash = bcrypt.hashSync(req.body.password, salt);
​
  knex("users").insert({
   email: req.body.email,
   password: hash
  })
  .returning("id")
  .then((userid) => {
   req.session.user_id = userid;
   res.redirect("/");
  })
​
});










app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
