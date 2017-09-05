# Better API

A Node.js implementation of a server that queries BD API by name, with an Elastic Search cache. The name of the company has been excluded (except in the source code) to avoid as much as possible google pointing this to future candidates.

## Install

In order to have elasticsearch up and running, we use docker with the official image of elasticsearch, since it is already configured. 

```
sudo docker pull docker.elastic.co/elasticsearch/elasticsearch:5.5.2
```

We also need to install the package with npm.

```
npm install
```

## Run

First we need to start the elasticsearch server.

```
sudo docker run -p 9200:9200 -e "http.host=0.0.0.0" -e "transport.host=127.0.0.1" docker.elastic.co/elasticsearch/elasticsearch:5.5.2
```

Then, we can proceed to start the server:

```
npm start
```

## Tests

There are some tests done with POSTMAN. In order to run them, use:

```npm test```

The underlying testing framework is [newman](https://www.npmjs.com/package/newman).

The tests target our own API, BD API, and the ES API and compare results for different queries.

## Notes

There have been a few things that are not as good as they can be because of time constraints (it has been a very demanding week at work). However, I would like to mention them.

### Unit Testing

It is one of the best practices to include unit tests, and it would be the natural next step. See [mocha](https://github.com/mochajs/mocha).

We already have some integration tests, which is good, but they have the problem of relying on BD API in order to being able to test. If DB API does not work, the tests would fail.

### Discrepancies between BD API and ES

Due to the difference in inner workings of Elastic Search and the BD API, we can find differences when we query for something that does not exist in the BD API but has a good match in ES. 

For example, if there is a James G. Johnson in the API, and we query for it and store in ES, searches for James AAAA Johnson will return the James Johnson record. However, if we did the same search in the BD API, it would not return anything. 

For solving the issue, we would need to start combining the normal best-matches of ES with [exact matches](https://www.elastic.co/guide/en/elasticsearch/guide/current/_finding_exact_values.html).

### Docker deployment

It would be a good idea include a docker file with the configuration (namely the password), and, in the code, take it from that file or another file. Moreover, we could also start both the node.js server and the ES server with docker combine.
