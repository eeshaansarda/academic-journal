#!/bin/sh
npm --prefix ../frontend build

docker build -t mongo_cs3099 ../mongo
docker build -t code_review ../../

docker-compose up -d
docker-compose exec mongo_cs3099 mongosh mongo-setup.js
docker-compose run --service-ports code_review ./backend.sh
