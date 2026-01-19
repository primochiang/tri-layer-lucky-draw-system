FROM node:22 AS build
LABEL "language"="nodejs"
LABEL "framework"="vite"

ENV PORT=8080
WORKDIR /src

RUN npm update -g npm
COPY . .
RUN npm install

# Build if we can build it
RUN npm run build

FROM scratch AS output
COPY --from=build /src//dist /
FROM zeabur/caddy-static AS runtime
COPY --from=output / /usr/share/caddy
