FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN pnpm install

COPY . .

RUN pnpm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "run", "start"]
