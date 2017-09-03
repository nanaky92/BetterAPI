'use strict';

const request = require('request');
const url = require('url');
const api_key = 'db55436ddde8bf51c815f51a705cec60';
const elasticConnector = require("../models/elasticConnector.js");
const bob = require('elastic-builder'); 

let anElasticConnector = new elasticConnector("localhost:9200", 
                                              "elastic", 
                                              "changeme");

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

function callRealApi(resource_url) {
  console.log("Calling real api");
  return new Promise((resolve, reject) => {
    return request(resource_url, (error, response, body) => {
      if (error) return reject(error)
      resolve(JSON.parse(body));
    });
  });
}


var search = function(req, res, next) {

  function searchDocumentInRealApiCbOK(response){
    console.log("Document retrieved from real api ok");
    res.setHeader('Content-Type', 'application/json');
    res.send(response);
  }

  function searchDocumentInRealApiCbKO(response){
    console.log("Failed response from real api");
    res.setHeader('Content-Type', 'application/json');
    res.send(response);
  }

  function searchDocumentInEsCbOK(response){
    console.log("Document found in ES, returning the document");
    res.setHeader('Content-Type', 'application/json');
    res.send(response.hits.hits[0]._source);
  }

  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;
  const resource_url = 'https://api.betterdoctor.com/2016-03-01/doctors?name=' + 
  query["name"] + '&limit=1&user_key=' + api_key;

  // Elastic search query
  const esRequestBody = bob.requestBodySearch()
      .query(bob.boolQuery()
        .should(bob.multiMatchQuery(['data.profile.first_name', 
          'data.profile.last_name'], 
          query.name)
        )
      );
      
   return anElasticConnector.search(index, type, esRequestBody.toJSON())
    .then(searchDocumentInEsCbOK)
    .catch((err) =>{
      return callRealApi(resource_url)
      .then(addDocumentInES)
      .then((documentResponse)=>{
        res.setHeader('Content-Type', 'application/json');
        res.send(documentResponse);
      })
    })
  
};

const addDocumentInES = (documentResponse) => {
  return anElasticConnector.create(index, "profile", documentResponse)
        .then((ESResponse) => {
          console.log("Insert document in ES");
          return documentResponse;
        })
        .catch( (error) => {
          console.log("Failed to insert document in ES");
          if(documentResponse) return documentResponse;
          return Promise.reject(error);
        })
}

exports.search = search;