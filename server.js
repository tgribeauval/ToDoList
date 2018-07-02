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

app.use("/mylist", listRoutes(knex));



let loggedIn = false;
// Home page
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

app.get("/update_category", (req, res)=>{

  knex("todo").where({
    'user_id': req.session.user_id,
    'content': req.query.content
  }).update({
    'category': req.query.category
  }).then(()=> {
    res.redirect("/mylist")
  })

})

app.get("/delete_item", (req, res)=>{

  knex("todo").where({
    'user_id': req.session.user_id,
    'content': req.query.content
  }).del().then(()=> {
    res.redirect("/mylist")
  })

})


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
          loggedIn = true;
          res.render("index");
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
    .where("id", Number(req.params.id))
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


app.post("/userInput", (req, res) =>{


 var uRequest = req.body['userData'];
 var uOutput = categoryFunc.categorizer(uRequest);
 var toGiveURL = uOutput[1]



 ///Figuring out which api to use

 if (uOutput[0] === 'to_watch'){
  fetch(`http://www.omdbapi.com/?apikey=${process.env.MOVIES_API}&t=${toGiveURL}`)
      .then(res => res.json()).then((json)=>{
        knex('todo').insert({
         user_id: req.session.user_id,
         category: uOutput[0],
         content: uOutput[1],
         description: [json.Title, json.Year, json.Plot]
        }).then(()=>{
         res.redirect('/mylist')
        })

      }
        )
      }

  else if (uOutput[0] === 'to_read'){
    fetch( `https://www.googleapis.com/books/v1/volumes?q=${uRequest}&maxResults=1&projection=lite&key=${process.env.BOOKS_API}`).then(res => res.json()).then((json) => {
          if (json.totalItems === 0){
            return console.log('book not found!')
          }
          console.log(json.items[0])
          knex('todo').insert({

           user_id: req.session.user_id,
           category: uOutput[0],
           content: uOutput[1],
           description: [json.items[0].volumeInfo.title, json.items[0].volumeInfo.authors, json.items[0].volumeInfo.publishedDate]
          }).then(()=>{
           res.redirect('/mylist')
          })
        })
 }

 else if (uOutput[0] === 'to_eat'){


  const client = yelp.client(process.env.YELP_API_KEY);
  var food = uRequest

  client.search({
    term:food,
    location: 'montreal, qc',
    sort_by: 'rating',
    limit: 1,
    price: [2,1]
  }).then(response => {
    if(response.statusCode !== 200){
      return console.log("Didnt find a restaurant for", food )
    }

  if(response.jsonBody.businesses.length === 0){
    return console.log("Didnt find a restaurant for", food )
  }
    for(var i = 0; i<response.jsonBody.businesses.length;i++){
      console.log((response.jsonBody.businesses[i].name));

      knex('todo').insert({

       user_id: req.session.user_id,
       category: uOutput[0],
       content: uOutput[1],
       description: (response.jsonBody.businesses[i].name)
      }).then(()=>{
       res.redirect('/mylist')
      })

    }
  })

 }

 else if (uOutput[0] === 'to_buy'){

  var params = {
    keywords: [uOutput[1]],
    outputSelector: ['AspectHistogram'],
    paginationInput: {
      entriesPerPage: 1
    },

    itemFilter: [
      {name: 'FreeShippingOnly', value: true},
      {name: 'MaxPrice', value: '150'}
    ],

    itemFilter: [
      {name: 'FreeShippingOnly', value: true},
      {name: 'MaxPrice', value: '150'}
    ],

    domainFilter: [
      {name: 'domainName', value: 'Digital_Cameras'}
    ]
  };

  ebay.xmlRequest({
      serviceName: 'Finding',
      opType: 'findItemsByKeywords',
      appId: process.env.THIERRY_EBAY_KEY,
      params: params,
      parser: ebay.parseResponseJson    // (default)
    },
    // gets all the items together in a merged array
    function itemsCallback(error, itemsResponse) {
      if (error) throw console.log(error);


      var items = itemsResponse.searchResult.item;

      if (items === undefined){
        return console.log("Could not find item:",params.keywords,"on EBAY");

      }





        knex('todo').insert({

         user_id: req.session.user_id,
         category: uOutput[0],
         content: uOutput[1],
         description: items.title
        }).then(()=>{
         res.redirect('/mylist')
        })

    }
  );

 }
 else {

 }



})


app.get("/mylist", (req, res) => {
  let user_id = req.session.user_id
  if (!user_id){
    res.redirect("/login")
  }
  else{
  res.render("list")}
 })


app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
