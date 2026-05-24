# backend/package.json

{
  "name": "virtual-media-backend",
  "version": "1.0.0",
  "description": "Backend API for Virtual Media Streaming Platform",
  "main": "server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node database/seed.js",
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "migrate": "node scripts/migrate.js",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.js\"",
    "build": "npm run test && npm run lint"
  },
  "keywords": [
    "streaming",
    "media",
    "api",
    "mongodb",
    "express"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^1.33.0",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.0.0",
    "express-validator": "^7.0.0",
    "helmet": "^7.1.0",
    "joi": "^17.11.0",
    "jsonwebtoken": "^9.1.0",
    "mongoose": "^8.0.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5",
    "nodemailer": "^6.9.7",
    "redis": "^4.6.11",
    "socket.io": "^4.7.0",
    "stripe": "^13.8.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@faker-js/faker": "^8.3.1",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "eslint": "^8.55.0",
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "prettier": "^3.1.1",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}

---

# frontend/package.json

{
  "name": "virtual-media-frontend",
  "version": "1.0.0",
  "description": "Frontend for Virtual Media Streaming Platform",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.292.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.20.0",
    "recharts": "^2.10.0",
    "socket.io-client": "^4.7.0",
    "zustand": "^4.4.2"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.7",
    "@tailwindcss/typography": "^0.5.10",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "postcss": "^8.4.32",
    "prettier": "^3.1.1",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8",
    "vitest": "^1.1.0"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}

---

# backend/.env.example

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=development
HOST=localhost

# ============================================
# DATABASE
# ============================================
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/virtual-media

# MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/virtual-media?retryWrites=true&w=majority

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-1234567890
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=30d

# ============================================
# FRONTEND CONFIGURATION
# ============================================
FRONTEND_URL=http://localhost:5173
FRONTEND_PROD_URL=https://yourdomain.com

# ============================================
# FILE UPLOAD
# ============================================
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=5242880000
ALLOWED_MIME_TYPES=video/mp4,audio/mpeg,image/jpeg,image/png

# ============================================
# CLOUDINARY (Media CDN)
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# AWS (Optional)
# ============================================
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# ============================================
# EMAIL CONFIGURATION
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@virtualmedia.com
SMTP_FROM_NAME=Virtual Media

# ============================================
# PAYMENT GATEWAY
# ============================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ============================================
# REDIS (Caching)
# ============================================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# ============================================
# ANALYTICS
# ============================================
GOOGLE_ANALYTICS_ID=UA-XXXXX
LOG_LEVEL=info

# ============================================
# SECURITY
# ============================================
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# FEATURE FLAGS
# ============================================
ENABLE_OAUTH=false
ENABLE_TWO_FA=false
ENABLE_ANALYTICS=true
ENABLE_EMAIL_VERIFICATION=false

---

# frontend/.env.example

# ============================================
# API CONFIGURATION
# ============================================
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# ============================================
# ENVIRONMENT
# ============================================
VITE_ENVIRONMENT=development
VITE_DEBUG=true

# ============================================
# ANALYTICS
# ============================================
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXX
VITE_SENTRY_DSN=

# ============================================
# FEATURE FLAGS
# ============================================
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_PWA=false
VITE_ENABLE_ANALYTICS=true

# ============================================
# CLOUDINARY
# ============================================
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name

---

# docker-compose.yml

version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7
    container_name: virtual-media-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: rootpassword
      MONGO_INITDB_DATABASE: virtual-media
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - virtual-media-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: virtual-media-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - virtual-media-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: virtual-media-backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://root:rootpassword@mongodb:27017/virtual-media?authSource=admin
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      FRONTEND_URL: http://localhost:3000
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
      - backend_uploads:/app/uploads
    networks:
      - virtual-media-network
    restart: unless-stopped

  # Frontend App
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: virtual-media-frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:5000
      VITE_SOCKET_URL: http://localhost:5000
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - virtual-media-network
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: virtual-media-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - virtual-media-network
    restart: unless-stopped

volumes:
  mongodb_data:
  mongodb_config:
  redis_data:
  backend_uploads:

networks:
  virtual-media-network:
    driver: bridge

---

# Dockerfile (Backend)

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/{videos,music,thumbnails}

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]

---

# Dockerfile (Frontend)

FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]

---

# .gitignore

# Dependencies
node_modules/
npm-debug.log
yarn-debug.log
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local

# Build output
dist/
build/
.next/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log

# Runtime data
tmp/
temp/
cache/

# Uploads
uploads/

# Testing
coverage/
.nyc_output/

# OS
Thumbs.db
.DS_Store

---

This package.json and environment configuration provides:

✅ All necessary dependencies
✅ Development and production scripts
✅ DevDependencies for testing and linting
✅ Proper configuration examples
✅ Docker support
✅ Multiple environment variables
✅ Security best practices
✅ Scalability considerations
