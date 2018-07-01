//API modules
var ebay = require('ebay-api');

const yelp = require('yelp-fusion');

const fetch = require('node-fetch');

require('dotenv').config();

const ENV = process.env.ENV || "development";




var MovieAPI = (uRequest) => {
  fetch(`http://www.omdbapi.com/?apikey=${process.env.MOVIES_API}&t=${uRequest}`)
      .then(res => res.json())
      .then((json) => {
        if (json.Response === 'False'){
          return console.log(json.Error)
        }
        knex('todo').insert
})
    }



var BookAPI = (uRequest) => {
  fetch( `https://www.googleapis.com/books/v1/volumes?q=${uRequest}&maxResults=1&projection=lite&key=${process.env.BOOKS_API}`).then(res => res.json()).then((json) => {
        if (json.totalItems === 0){
          return console.log('book not found!')
        }

        return JSON.parse(json.items[0].volumeInfo.title)
      })

}

var yelpAPI = (uRequest) => {
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
      return JSON.parse(response.jsonBody.businesses[i].name);
    }
  })
}

var ebayAPI = (uRequest) => {
  var params = {
    keywords: [uRequest],
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




      for (var i = 0; i < items.length; i++) {
        return JSON.parse(items[i].title);
      }
    }
  );
}

module.exports = {MovieAPI, BookAPI, yelpAPI, ebayAPI};

