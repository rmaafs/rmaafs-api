FROM node:14.18-alpine3.12

WORKDIR /app

COPY . .
RUN npm install

CMD ["npm", "start"]