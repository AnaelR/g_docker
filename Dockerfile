FROM node:alpine
RUN npm ci
COPY . /app
WORKDIR /app
CMD npm start