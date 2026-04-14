FROM ghcr.io/puppeteer/puppeteer:latest

# We don't need to install Chromium manually since the puppeteer base image includes it.
# We just copy our app files.

USER root
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set environment variables for Puppeteer cache inside docker
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Non-root user comes with the image
USER pptruser

EXPOSE 5001
CMD ["node", "server.js"]
