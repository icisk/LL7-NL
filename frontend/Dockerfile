#
#   build stage
#
FROM node:20-slim AS build
#
#   prepare pnpm
#
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack && corepack enable 
#RUN corepack use pnpm@9.x
RUN corepack prepare pnpm@9.0.0 --activate
RUN mkdir /app
#
#   build
#
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm run build
#
#   run stage
#
FROM nginxinc/nginx-unprivileged:stable-alpine-slim

COPY --from=build /app/dist/www /usr/share/nginx/html
