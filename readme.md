npm install

sudo docker pull docker.elastic.co/elasticsearch/elasticsearch:5.5.2

sudo docker run -p 9200:9200 -e "http.host=0.0.0.0" -e "transport.host=127.0.0.1" docker.elastic.co/elasticsearch/elasticsearch:5.5.2

npm start

npm test