#Better API

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

There have been a few things that were not included because of time limits.
### Unit Testing

It would be a good practice to include unit tests. Since the time 

### Discrepancies


### Docker file
