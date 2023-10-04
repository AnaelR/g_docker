FROM node:alpine
RUN npm i
COPY . /app
WORKDIR /app
CMD npm start