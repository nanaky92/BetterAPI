'use strict';

const request = require('request');
const url = require('url');
const api_key = 'db55436ddde8bf51c815f51a705cec60'; // Get your API key at developer.betterdoctor.com
const elasticConnector = require("../models/elasticConnector.js");
const bob = require('elastic-builder'); // the builder

let anElasticConnector = new elasticConnector("localhost:9200", 
  "elastic", 
  "elasticpassword");

function pingCallbackOK() {
    console.log('Elasticsearch cluster is up');
}
function pingCallbackError(error) {
    console.trace('Elasticsearch cluster is down!');
    console.log(error);
}

anElasticConnector.ping()
  .then(pingCallbackOK)
  .catch(pingCallbackError);

const index = "doctor";
const type = "profile";

var search = function(req, res) {
  

  // if(!query["name"]){
  //   res.send("ERROR");
  //   return;
  // }


  function createDocumentCbOK(response){
     console.log("Document inserted in ES");
     console.log(response);
     console.log();
  }

  function createDocumentCbError(error){
      console.log("Failed to insert document in ES");
      console.log(error);
      console.log();
  }

  function searchDocumentCbOK(response){
    console.log("Document found in ES, returning the document");
    console.log();
    console.dir(response.hits);
    res.send(response.hits);
  }

  function searchDocumentCbError(error){
    console.log("Document not found in ES, going to the final API");
    var resource_url = 'https://api.betterdoctor.com/2016-03-01/doctors?name=' + 
    query["name"] + '&limit=1&user_key=' + api_key;
    
    request(resource_url, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log();
      res.send(body);
      
      anElasticConnector.create(index, "profile", body)
        .then(createDocumentCbOK)
        .catch(createDocumentCbError);
    });
  }
  
  res.setHeader('Content-Type', 'application/json');
  

  console.log(req.url);
  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;


  // Bool query
  const requestBody = bob.requestBodySearch()
      .query(
          bob.boolQuery()
              .should(bob.multiMatchQuery(['data.profile.first_name', 'data.profile.last_name'], query["name"])
    )
  );

  console.dir(requestBody.toJSON());

  anElasticConnector.search(index, type, requestBody.toJSON())
    .then(searchDocumentCbOK)
    .catch(searchDocumentCbError);
  
  // anElasticConnector.search(index, query);

};

exports.search = search;

// {
//    "query":{
//       "bool":{
//          "should":[
//             {
//                "match":{
//                   "data.profile.first_name":"James"
//                }
//             },
//             {
//                "match":{
//                   "data.profile.last_name":"Lo"
//                }
//             }
//          ]
//       }
//    }
// }
