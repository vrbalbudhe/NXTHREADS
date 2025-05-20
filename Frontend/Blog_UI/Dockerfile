FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ libssl-dev && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

FROM node:20-slim

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
