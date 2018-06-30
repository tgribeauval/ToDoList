"use strict";

const express = require('express');
const listRoutes  = express.Router();
const bodyParser    = require("body-parser");
const cookieSession = require('cookie-session');

module.exports = (knex) => {

  listRoutes.get("/", (req, res) => {
    let user_id = req.session.user_id
    res.render("list")
   })

  return listRoutes;
}
