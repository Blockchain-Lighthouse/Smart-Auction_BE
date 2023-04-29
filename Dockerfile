FROM node:16-alpine
# RUN mkdir -p /app
WORKDIR /app
# My . Dir -> /app Directory
ADD . /app/
# Dependency Install
RUN npm install
# Build
RUN npm run build
# PORT (8080) Expose
EXPOSE 8080
# START
ENTRYPOINT npm run start:prod