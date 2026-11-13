# Build the static site with rootless BuildKit (zero Docker daemon), then serve
# it with unprivileged nginx running as a non-root user on port 8080.
#
#   buildctl build --frontend dockerfile.v0 --local context=. --local dockerfile=. \
#     --opt filename=Containerfile --output type=image,name=cs-registry.clearedstack.svc:5000/clearedstack-web:latest,push=true

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 8080
