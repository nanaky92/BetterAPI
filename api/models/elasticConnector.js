'use strict'
var url = require('url');
var elasticsearch = require('elasticsearch');

class ElasticConnector{
  constructor(host, userName, password) {
    this.client = new elasticsearch.Client({  
      host: host,
      httpAuth: `${userName}:${password}`,
      log: 'info'
    });
  }

  ping(){
    return new Promise((resolve, reject) => {
      this.client.ping({
        requestTimeout: 1000
      }, function(error){
        if(error) return reject(error);
        resolve();
      });
    });
  }
  
  search(index, type, body){
    return new Promise ( (resolve, reject) =>{
      this.client.search({
        index: index,
        type: type,
        body: body
      }, function(error, response){
        if(error || response.hits.total == 0) return reject(error);
        resolve(response);        
      });
    });

  }

  create(index, type, body){
    return new Promise( (resolve, reject) => {
     this.client.index({
        index: index,
        type: type,
        body: body
      }, function (error, response) {
        if(error) return reject(error);
        resolve(response);
      });
    });
  }
}

module.exports = ElasticConnector;