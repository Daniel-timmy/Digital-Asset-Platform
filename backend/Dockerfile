FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY vercel.json ./

RUN npm ci

COPY src ./src

RUN npm run build

# Development stage (can be used with docker-compose for hot-reloading)
# This stage has all dependencies including devDependencies

# Prod

FROM node:22-alpine AS production

ARG USERNAME=appuser
ARG USER_UID=1000
ARG USER_GID=1000

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vercel.json ./

RUN npm ci --omit=dev --ignore-scripts

RUN addgroup --gid $USER_GID $USERNAME \
    && adduser --uid $USER_UID --gid $USER_GID --disabled-password --gecos "" $USERNAME \
    && chown -R $USERNAME:$USERNAME /app

USER $USERNAME

EXPOSE 3000

CMD ["npm", "run", "start"]

