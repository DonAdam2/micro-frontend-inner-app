FROM node:24-alpine AS application_base

WORKDIR /usr/app

COPY ["package.json", "yarn.lock", "/usr/app/"]

RUN yarn install --silent

COPY . ./

#################################
# Starting from application_base image above
# Build the application for development environment
#################################
FROM application_base AS development

# Remove unwnated files
RUN rm environments/.env

CMD ["yarn", "start"]

#################################
# Starting from application_base image above
# Build the application for production environment
#################################
# step1 => build react app
FROM application_base AS build

RUN yarn build

# step2 => copy react build into nginx (update it to meet your needs)
FROM nginx:alpine AS production

# single page app routing, CORS for the host apps and caching rules
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# generates remotes.json from the REMOTE_<APP_NAME> environment variables when the container starts
COPY --chmod=755 docker/40-remotes-json.sh /docker-entrypoint.d/

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from build stage
COPY --from=build /usr/app/dist .

# the default entrypoint of the nginx image runs the /docker-entrypoint.d scripts, then starts nginx (daemon off)
