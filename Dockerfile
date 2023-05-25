FROM node:18.16.0
WORKDIR /app
COPY package*.json ./
RUN yarn
COPY . .
EXPOSE ${PORT}
CMD ["yarn", "start:dev"]
