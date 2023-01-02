FROM node:latest

WORKDIR /app

COPY ./backend ./backend
COPY ./build ./build
COPY ./production/backend/backend.sh ./

RUN chmod u+x ./backend.sh
RUN npm --prefix ./backend install