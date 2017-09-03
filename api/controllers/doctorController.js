'use strict';

const request = require('request');
const url = require('url');
const api_key = 'db55436ddde8bf51c815f51a705cec60';
const elasticConnector = require("../models/elasticConnector.js");
const bob = require('elastic-builder'); 

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

  function createDocumentCbOK(response){
     console.log("Document inserted in ES");
     console.log(response);
  }

  function createDocumentCbError(error){
      console.log("Failed to insert document in ES");
      console.log(error);
  }

  function searchDocumentCbOK(response){
    console.log("Document found in ES, returning the document");
    res.send(response.hits);
  }

  function searchDocumentCbError(error){
    console.log("Document not found in ES, going to the final API");
    var resource_url = 'https://api.betterdoctor.com/2016-03-01/doctors?name=' + 
    query["name"] + '&limit=1&user_key=' + api_key;
    
    request(resource_url, function (error, response, body) {
      res.send(body);
      
      anElasticConnector.create(index, "profile", body)
        .then(createDocumentCbOK)
        .catch(createDocumentCbError);
    });
  }

  if (!req.query.name) 
    return res.status(400).json({"Error": "No name parameter"});
  
  res.setHeader('Content-Type', 'application/json');

  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;

  // Elastic search query
  const esRequestBody = bob.requestBodySearch()
      .query(bob.boolQuery()
        .should(bob.multiMatchQuery(['data.profile.first_name', 
          'data.profile.last_name'], 
          query.name)
        )
      );
      
  anElasticConnector.search(index, type, esRequestBody.toJSON())
    .then(searchDocumentCbOK)
    .catch(searchDocumentCbError);
  
};

exports.search = search;