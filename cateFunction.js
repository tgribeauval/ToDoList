require('dotenv').config();

var _ = require('lodash');
const session = require("express-session");

var keyword = {'to_watch': ['watch', 'view', 'attend', 'see'],
'to_read': ['read', 'interpret','study'],
'to_buy':['buy', 'purchase', 'get', 'acquire'],
'to_eat': ['eat', 'gorge','devour','dine','lunch','breakfast','dinner'] }

var categorizer = (text) => {


var res = text.split(" ");

var toRemove = '';
var category ='other';
var AddToCat = '';


for (cat in keyword){

  var current = keyword[cat];
  for (var i =0; i < current.length; i++){
    if (_.some(res, _.method('includes',current[i])) === true){
      toRemove = current[i];
      category = cat;

    }

  }
}


var index = _.remove(res, function(input){
  return input !== toRemove;
})

AddToCat = index.join(' ')


return [category, AddToCat];

}

module.exports = {categorizer}
