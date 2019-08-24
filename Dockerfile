

# stage 2 get node_modules
FROM node:10-alpine as prod-builder
WORKDIR /usr/app
COPY ["package*.json", "./"]
RUN npm install --production

# stage 3
FROM node:10-alpine
WORKDIR /usr/app
COPY --from=prod-builder /usr/app/node_modules ./node_modules
COPY src ./src
# user node is created in base image with uid 1000
#USER node
# since kube wants the user to be nomiric we substiture the username with the uid
USER 1000
ENTRYPOINT ["node", "./src/bin/www"]