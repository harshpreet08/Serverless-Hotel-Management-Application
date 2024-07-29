FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ENV REACT_APP_ENVIRONMENT="production"

# CMD ["node", "--max-old-space-size=2048", "node_modules/react-scripts/scripts/start.js"]

CMD ["npm", "start"]

