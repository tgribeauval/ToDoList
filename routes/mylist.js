"use strict";

const express = require('express');
const listRoutes  = express.Router();
const bodyParser    = require("body-parser");
const cookieSession = require('cookie-session');
const categoryFunc = require('../cateFunction');
//Require API functions

const fetch = require('node-fetch');
const yelp = require('yelp-fusion');
const ebay = require('ebay-api');

module.exports = (knex) => {

 listRoutes.get('/items', (req, res) =>{
  let user_id = req.session.user_id;
  if (!user_id){
    res.redirect('/login')
  }
  else{
   knex('todo')
   .select("*")
   .from('todo')
   .where('user_id', req.session.user_id)
   .then((results) => {
     res.json(results);
   })}
 })

 listRoutes.get("/update_category", (req, res)=>{

   if (req.query.category === 'to_watch'){
    fetch(`http://www.omdbapi.com/?apikey=${process.env.MOVIES_API}&t=${req.query.content}`)
        .then(res => res.json()).then((json)=>{
          knex('todo').where({
           'user_id': req.session.user_id,
           'content': req.query.content})
           .update({
           category: req.query.category,
           description: 'Title: ' + json.Title,
           description2: 'Date Released: ' + json.Released,
           description3: "METACRITIC score: " + json.Metascore,
           description4: "Summary: " + json.Plot
          }).then(()=>{
           res.redirect('/mylist')
          })

        }
          )
        }

        else if (req.query.category === 'to_read'){
         fetch(`https://www.googleapis.com/books/v1/volumes?q=${req.query.content}&maxResults=1&projection=lite&key=${process.env.BOOKS_API}`)
             .then(res => res.json()).then((json)=>{
               knex('todo').where({
                'user_id': req.session.user_id,
                'content': req.query.content})
                .update({
                category: req.query.category,
                description: "Title: " + json.items[0].volumeInfo.title,
                description2:"Author(s): " + json.items[0].volumeInfo.authors[0],
                description3: "Publisher: " + json.items[0].volumeInfo.publisher,
                description4: "Summary: " + json.items[0].volumeInfo.publisher
               }).then(()=>{
                res.redirect('/mylist')
               })

             }
               )
             }

       else if (req.query.category === 'to_eat'){


        const client = yelp.client(process.env.YELP_API_KEY);
        var food = req.query.content;

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

            knex('todo').where({
             'user_id': req.session.user_id,
             'content': req.query.content})
             .update({
             category: req.query.category,
              description: "Restaurant name: " + response.jsonBody.businesses[i].name,
              description2: "Yelp Rating: " + response.jsonBody.businesses[i].rating,
              description3: "Location: " + response.jsonBody.businesses[i].location.display_address[0],
              description4: "Phone: " + response.jsonBody.businesses[i].phone
             }).then(()=>{
            }).then(()=>{
             res.redirect('/mylist')
            })


          }
        })

       }


       else if (req.query.category === 'to_buy'){

        var params = {
          keywords: [req.query.content],
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

             knex('todo').where({
             'user_id': req.session.user_id,
             'content': req.query.content})
             .update({
             category: req.query.category,
              description: "Product Title: " + items.title,
              description2: "Price: " + items.sellingStatus.currentPrice.amount + "USD",
              description3: "PaymentMethod: " + items.paymentMethod,
              description4: "Shipment Location: " + items.location
             }).then(()=>{
            }).then(()=>{
             res.redirect('/mylist')
            })

          }
        );

       }

       else if (req.query.category === 'other'){

        var params = {
          keywords: [req.query.content],
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

             knex('todo').where({
             'user_id': req.session.user_id,
             'content': req.query.content})
             .update({
             category: req.query.category,
              description: "Product Title: " + items.title,
              description2: "Price: " + items.sellingStatus.currentPrice.amount + "USD",
              description3: "PaymentMethod: " + items.paymentMethod,
              description4: "Shipment Location: " + items.location
             }).then(()=>{
            }).then(()=>{
             res.redirect('/mylist')
            })

          }
        );

       }

 })

 listRoutes.get("/delete_item", (req, res)=>{

   knex("todo").where({
     'user_id': req.session.user_id,
     'content': req.query.content
   }).del().then(()=> {
     res.redirect("/mylist")
   })

 })

 listRoutes.post("/userInput", (req, res) =>{


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
          description: 'Title: ' + json.Title,
          description2: 'Date Released: ' + json.Released,
          description3: "METACRITIC score: " + json.Metascore,
          description4: "Summary: " + json.Plot
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

           knex('todo').insert({

            user_id: req.session.user_id,
            category: uOutput[0],
            content: uOutput[1],
            description: "Title: " + json.items[0].volumeInfo.title,
            description2:"Author(s): " + json.items[0].volumeInfo.authors[0],
            description3: "Publisher: " + json.items[0].volumeInfo.publisher,
            description4: "Summary: " + json.items[0].volumeInfo.publisher

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
        description: "Restaurant name: " + response.jsonBody.businesses[i].name,
        description2: "Yelp Rating: " + response.jsonBody.businesses[i].rating,
        description3: "Location: " + response.jsonBody.businesses[i].location.display_address[0],
        description4: "Phone: " + response.jsonBody.businesses[i].phone
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
          description: "Product Title: " + items.title,
          description2: "Price: " + items.sellingStatus.currentPrice.amount + "USD",
          description3: "PaymentMethod: " + items.paymentMethod,
          description4: "Shipment Location: " + items.location
         }).then(()=>{
          res.redirect('/mylist')
         })

     }
   );

  }

  else {

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
          description: "Product Title: " + items.title,
          description2: "Price: " + items.sellingStatus.currentPrice.amount + "USD",
          description3: "PaymentMethod: " + items.paymentMethod,
          description4: "Shipment Location: " + items.location
         }).then(()=>{
          res.redirect('/mylist')
         })

     }
   );

  }

 })


 listRoutes.get("/", (req, res) => {
   let user_id = req.session.user_id
   if (!user_id){
     res.redirect("/login")
   }
   else{
   res.render("list")}
  })





  return listRoutes;
}
