#!/bin/bash
port=${1:-23413}

## Run from production directory
docker pull docker.io/redis

echo "Removing Existing Pod"
podman pod kill ecstatic_bohr
podman pod rm ecstatic_bohr

echo "Building Mongo"
podman build --pull -t mongo_cs3099 ./mongo

echo "Building Frontend"
npm --prefix ../frontend i
npm --prefix ../frontend run build

echo "Building Backend"
podman build --pull -t code_review ../

echo "Creating Pod"
podman pod create --name ecstatic_bohr -p $port:8080

echo "Creating Storage"
podman volume create mongostorage
podman volume create redistorage

echo "Running Redis Container"
podman run -d --name redis_cs3099 -v redistorage:/data/db --pod ecstatic_bohr -it redis

echo "Running Mongo Container"
podman run -d -v mongostorage:/data/db --name mongo_cs3099 --pod ecstatic_bohr -it localhost/mongo_cs3099 mongod --config mongod.conf
podman exec -it mongo_cs3099 mongosh mongo-setup.js

echo "Running Code Container"
podman run -d  --name code_review --pod ecstatic_bohr -it localhost/code_review
podman exec -it code_review npm --prefix ./backend start
