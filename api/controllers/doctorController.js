'use strict'

const request = require('request')
const apiKey = 'db55436ddde8bf51c815f51a705cec60'
const ElasticConnector = require('../models/elasticConnector.js')
const bob = require('elastic-builder')

let anElasticConnector = new ElasticConnector('localhost:9200',
                                              'elastic',
                                              'changeme')

function pingCallbackOK () {
  console.log('Elasticsearch cluster is up')
}

function pingCallbackError (error) {
  console.trace('Elasticsearch cluster is down!')
  console.log(error)
}

anElasticConnector.ping()
  .then(pingCallbackOK)
  .catch(pingCallbackError)

const index = 'doctor'
const type = 'profile'

const callRealApi = (resourceUrl) => {
  console.log('Calling real api')
  return new Promise((resolve, reject) => {
    return request(resourceUrl, (error, response, body) => {
      if (error) return reject(error)
      resolve(JSON.parse(body))
    })
  })
}

const search = (req, res, next) => {
  const searchDocumentInEsCbOK = (response) => {
    console.log('Document found in ES, returning the document')
    res.setHeader('Content-Type', 'application/json')
    res.send(response.hits.hits[0]._source)
  }

  const resourceUrl = 'https://api.betterdoctor.com/2016-03-01/doctors?name=' +
  req.query.name + '&limit=1&user_key=' + apiKey

  // Elastic search query

  let esRequestBody = buildQuery(req.query.name)

  return anElasticConnector.search(index, type, esRequestBody.toJSON())
    .then(searchDocumentInEsCbOK)
    .catch(() => {
      return callRealApi(resourceUrl)
      .then(addDocumentInES)
      .catch((err) => {
        // Error while adding to ES or retrieving from API
        return next({'statusCode': 500,
          'error': {'error': err}})
      })
    })
}

const addDocumentInES = (documentResponse) => {
  return anElasticConnector.create(index, 'profile', documentResponse)
        .then((ESResponse) => {
          console.log('Insert document in ES')
          return documentResponse
        })
        .catch((error) => {
          console.log('Failed to insert document in ES')
          if (documentResponse) return documentResponse
          return Promise.reject(error)
        })
}

const buildQuery = (nameStr) => {
  const nameArr = nameStr.split(' ')
  if (nameArr.length > 2) {
    return bob.requestBodySearch()
            .query(bob.boolQuery()
              .should(bob.matchQuery('data.profile.first_name', nameArr[0]))
              .should(bob.matchQuery('data.profile.middle_name',
                                      nameArr.slice(1, nameArr.length - 1).join(' ')))
              .should(bob.matchQuery('data.profile.last_name', nameArr[nameArr.length - 1]))
            )
  }
  if (nameArr.length === 2) {
    return bob.requestBodySearch()
            .query(bob.boolQuery()
              .should(bob.matchQuery('data.profile.first_name', nameArr[0]))
              .should(bob.matchQuery('data.profile.last_name', nameArr[1]))
            )
  } else {
    return bob.requestBodySearch()
            .query(bob.boolQuery()
              .should(
                bob.multiMatchQuery(
                  ['data.profile.first_name', 'data.profile.last_name'],
                  nameArr.join(' '))
              )
            )
  }
}

exports.search = search
