# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set production environment
ENV NODE_ENV=production

# Create a non-root user
RUN useradd -m -u 1001 appuser

# Set the working directory
WORKDIR /usr/src/app

# Install system dependencies required by Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
    libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 \
    libgcc1 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
    libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
    libxrender1 libxss1 libxtst6 wget xdg-utils \
  && rm -rf /var/lib/apt/lists/*

# Copy package manifest and lockfile
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm for production
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Copy application source code
COPY . .

# Change ownership to the app user
RUN chown -R appuser:appuser /usr/src/app
USER appuser

# Expose port and define the start command
EXPOSE 8080
CMD ["node", "index.js"]
