# 1. Build Stage
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_AI_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AI_BASE_URL=$VITE_AI_BASE_URL

COPY . .
RUN npm run build

# 2. Nginx Stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
