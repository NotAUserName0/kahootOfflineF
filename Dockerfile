#1mer paso configurar node
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --prod

#2do paso configurar nginx

FROM nginx:1.17.1-alpine

COPY --from=build /usr/src/app/dist/app-cuestionario /usr/share/nginx/html

COPY --from=build /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4201
