"use strict";

const express = require('express');
const listRoutes  = express.Router();
const bodyParser    = require("body-parser");
const cookieSession = require('cookie-session');

module.exports = (knex) => {

 listRoutes.get('/items', (req, res) =>{
   knex('todo')
   .select("*")
   .from('todo')
   .where('user_id', req.session.user_id)
   .then((results) => {
     console.log("got here buddy")
     console.log(results);
     res.json(results);
   })
 })


  return listRoutes;
}
