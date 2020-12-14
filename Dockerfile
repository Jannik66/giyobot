# Transpile typescript into javascript
FROM node:lts-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# create image for production
FROM node:lts-alpine
WORKDIR /giyobot
COPY package*.json ./
RUN npm install --production
COPY --from=0 ./app/dist .
CMD npm start