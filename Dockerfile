FROM node:24-bookworm-slim AS builder

WORKDIR /app

ENV HUSKY=0

COPY package.json package-lock.json ./
COPY .husky ./.husky

RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --omit=dev


FROM node:24-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER node

EXPOSE 10000

CMD ["npm", "run", "start:prod"]