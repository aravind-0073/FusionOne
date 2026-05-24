# Deployment & Performance Optimization Guide
# Virtual Media Streaming Platform

---

## 🚀 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (unit, integration, E2E)
- [ ] No console.log statements (use logger)
- [ ] No hardcoded secrets (use .env)
- [ ] No TODO comments without issues
- [ ] Code follows style guide
- [ ] No circular dependencies
- [ ] No unused imports or variables

### Security
- [ ] All endpoints authenticated/authorized
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection prevention
- [ ] XSS protection enabled
- [ ] CORS properly configured
- [ ] Rate limiting configured
- [ ] Password requirements enforced
- [ ] Sensitive data not logged
- [ ] Dependencies scanned for vulnerabilities

### Performance
- [ ] Database indexes created
- [ ] Aggregation pipelines optimized
- [ ] API response times < 200ms
- [ ] Frontend bundle size < 500KB
- [ ] Images optimized
- [ ] Caching configured
- [ ] CDN configured
- [ ] Database connection pooling
- [ ] Load testing completed

### Infrastructure
- [ ] Environment variables documented
- [ ] Database backups configured
- [ ] Monitoring/alerting set up
- [ ] Logging configured
- [ ] SSL certificates obtained
- [ ] Auto-scaling configured
- [ ] Health checks configured
- [ ] Disaster recovery plan
- [ ] Documentation complete

---

## 📦 Docker Deployment

### Build Docker Images

```bash
# Build backend image
docker build -t virtual-media-backend:1.0.0 ./backend

# Build frontend image
docker build -t virtual-media-frontend:1.0.0 ./frontend

# Tag for registry
docker tag virtual-media-backend:1.0.0 myregistry.azurecr.io/virtual-media-backend:1.0.0
docker tag virtual-media-frontend:1.0.0 myregistry.azurecr.io/virtual-media-frontend:1.0.0

# Push to registry
docker push myregistry.azurecr.io/virtual-media-backend:1.0.0
docker push myregistry.azurecr.io/virtual-media-frontend:1.0.0
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    image: myregistry.azurecr.io/virtual-media-backend:1.0.0
    container_name: api
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: ${MONGODB_URI}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 5000
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
      - redis
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: myregistry.azurecr.io/virtual-media-frontend:1.0.0
    container_name: web
    restart: always
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: https://api.example.com
      VITE_SOCKET_URL: https://api.example.com
    depends_on:
      - backend
    networks:
      - app-network

  mongodb:
    image: mongo:7
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASS}
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASS}
    volumes:
      - redis_data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mongodb_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

---

## ☁️ Cloud Deployment

### AWS Deployment (ECS + RDS)

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name virtual-media

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster virtual-media \
  --service-name api \
  --task-definition api:1 \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-1,subnet-2],securityGroups=[sg-1],assignPublicIp=ENABLED}"

# Create RDS MongoDB instance
aws rds create-db-instance \
  --db-instance-identifier virtual-media-mongo \
  --db-instance-class db.t3.medium \
  --engine docdb \
  --master-username admin \
  --master-user-password ${SECURE_PASSWORD}

# Create ElastiCache Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id virtual-media-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### GCP Deployment (Cloud Run + Firestore)

```bash
# Build and deploy backend
gcloud run deploy virtual-media-api \
  --source ./backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars MONGODB_URI=${MONGODB_URI},REDIS_URL=${REDIS_URL}

# Build and deploy frontend
gcloud run deploy virtual-media-web \
  --source ./frontend \
  --platform managed \
  --region us-central1

# Create Cloud SQL MongoDB instance
gcloud sql instances create virtual-media-mongo \
  --database-version MONGO_6_0 \
  --tier db-custom-4-16384 \
  --region us-central1

# Create Memorystore Redis instance
gcloud redis instances create virtual-media-redis \
  --size=5 \
  --region=us-central1
```

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create virtual-media-api
heroku create virtual-media-web

# Set environment variables
heroku config:set JWT_SECRET=${JWT_SECRET} --app virtual-media-api
heroku config:set MONGODB_URI=${MONGODB_URI} --app virtual-media-api
heroku config:set REDIS_URL=${REDIS_URL} --app virtual-media-api

# Deploy backend
git subtree push --prefix backend heroku main

# Deploy frontend
git subtree push --prefix frontend heroku main

# View logs
heroku logs --tail --app virtual-media-api
```

---

## 📊 Performance Optimization

### Backend Optimization

#### 1. Database Query Optimization

```javascript
// ❌ Bad: Multiple queries
const user = await User.findById(userId);
const creator = await Creator.findOne({ userId });
const media = await Media.find({ creatorId: creator._id });

// ✅ Good: Single aggregation
const data = await User.aggregate([
  { $match: { _id: ObjectId(userId) } },
  {
    $lookup: {
      from: 'creators',
      localField: '_id',
      foreignField: 'userId',
      as: 'creator'
    }
  },
  { $unwind: '$creator' },
  {
    $lookup: {
      from: 'media',
      localField: 'creator._id',
      foreignField: 'creatorId',
      as: 'media'
    }
  }
]);
```

#### 2. Implement Caching

```javascript
// Redis caching pattern
const getRecommendations = async (userId) => {
  const cacheKey = `recommendations:${userId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('Cache hit');
    return JSON.parse(cached);
  }
  
  // Cache miss - compute and store
  const recommendations = await computeRecommendations(userId);
  await redis.setex(cacheKey, 3600, JSON.stringify(recommendations)); // 1 hour TTL
  
  return recommendations;
};
```

#### 3. Pagination

```javascript
// Always paginate large result sets
const getMediaList = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;
  
  const media = await Media.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await Media.countDocuments();
  
  res.json({
    data: media,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
};
```

#### 4. Connection Pooling

```javascript
// mongoose.js configuration
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 50,      // Max connections to maintain
  minPoolSize: 10,      // Min connections to keep open
  maxIdleTimeMS: 45000, // Close idle connections after 45s
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4             // Use IPv4
});
```

#### 5. Compression

```javascript
// Compress all responses
const compression = require('compression');
app.use(compression({
  level: 6,             // Balance compression vs speed
  threshold: 1024       // Only compress > 1KB
}));
```

#### 6. Load Balancing

```javascript
// Round-robin load balancing
const { createServer } = require('http');
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // Restart dead workers
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Worker code
  const app = require('./app');
  const server = createServer(app);
  server.listen(5000);
}
```

### Frontend Optimization

#### 1. Code Splitting

```javascript
// Dynamic imports for route-based splitting
const Home = React.lazy(() => import('./pages/Home'));
const Explore = React.lazy(() => import('./pages/Explore'));
const Learning = React.lazy(() => import('./pages/Learning'));

const App = () => (
  <Routes>
    <Route path="/" element={<Suspense fallback={<Loading />}><Home /></Suspense>} />
    <Route path="/explore" element={<Suspense fallback={<Loading />}><Explore /></Suspense>} />
    <Route path="/learning" element={<Suspense fallback={<Loading />}><Learning /></Suspense>} />
  </Routes>
);
```

#### 2. Image Optimization

```javascript
// Use responsive images
<picture>
  <source srcSet="image-320w.jpg 320w, image-640w.jpg 640w" media="(max-width: 768px)" />
  <source srcSet="image-1280w.jpg 1280w" media="(min-width: 769px)" />
  <img src="image-fallback.jpg" alt="Description" loading="lazy" />
</picture>

// Or use next-gen formats
<img src="image.jpg" srcSet="image.webp" alt="Description" />
```

#### 3. Virtual Scrolling

```javascript
// For large lists, use virtual scrolling
import { FixedSizeList } from 'react-window';

const MediaList = ({ items }) => (
  <FixedSizeList
    height={600}
    itemCount={items.length}
    itemSize={100}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <MediaCard media={items[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

#### 4. Lazy Load Media

```javascript
// Lazy load video/audio
const VideoPlayer = ({ src }) => {
  const [videoSrc, setVideoSrc] = useState(null);
  
  useEffect(() => {
    // Load when user clicks play
    setVideoSrc(src);
  }, []);
  
  return videoSrc ? <video src={videoSrc} /> : <placeholder />;
};
```

#### 5. Service Workers (PWA)

```javascript
// Register service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// sw.js - Cache strategy
const CACHE_NAME = 'v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## 🔍 Monitoring & Logging

### Application Logging

```javascript
// Use structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('User logged in', { userId, timestamp: new Date() });
logger.error('Database error', { error: err.message });
```

### Performance Monitoring

```javascript
// Track API response times
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration
    });
    
    // Send to monitoring service
    if (duration > 500) {
      metrics.recordSlowRequest(req.path, duration);
    }
  });
  
  next();
});
```

### Health Checks

```javascript
// Health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date(),
    checks: {}
  };
  
  try {
    // Check MongoDB
    await mongoose.connection.db.admin().ping();
    health.checks.database = 'OK';
  } catch {
    health.status = 'DEGRADED';
    health.checks.database = 'FAILED';
  }
  
  try {
    // Check Redis
    await redis.ping();
    health.checks.cache = 'OK';
  } catch {
    health.status = 'DEGRADED';
    health.checks.cache = 'FAILED';
  }
  
  res.status(health.status === 'OK' ? 200 : 503).json(health);
});
```

---

## 📈 Scaling Strategies

### Database Scaling

**Vertical Scaling**
```
Single Instance
├─ CPU: 2 → 4 → 8 cores
├─ RAM: 4GB → 8GB → 16GB
└─ Storage: Increase capacity
```

**Horizontal Scaling (Sharding)**
```
Shard by creatorId
├─ Shard 1: [0-333...]
├─ Shard 2: [333...-666...]
├─ Shard 3: [666...-999...]
└─ Config Server: Metadata
```

**Replication**
```
Replica Set
├─ Primary: Read + Write
├─ Secondary 1: Read-only
├─ Secondary 2: Read-only
└─ Arbiter: Voting (no data)
```

### Application Scaling

```
Load Balancer (Nginx/HAProxy)
├─ Instance 1 (1000 conn/s)
├─ Instance 2 (1000 conn/s)
├─ Instance 3 (1000 conn/s)
└─ Instance N...
Total Capacity: n * 1000 conn/s
```

### CDN Scaling

```
Origin Server (10 Gbps)
└─ CDN Edge Nodes (100 Gbps+)
   ├─ US East
   ├─ US West
   ├─ Europe
   ├─ Asia
   └─ Australia
```

---

## 🔄 Zero-Downtime Deployment

### Blue-Green Deployment

```
Current (Blue)
├─ v1.0.0 (100% traffic)
└─ Healthy

New (Green)
├─ v2.0.0 (0% traffic)
├─ Deploy and test
├─ Run smoke tests
└─ Pass health checks

Switch Traffic
└─ v2.0.0 (100% traffic)

Rollback (if needed)
└─ Route traffic back to Blue
```

### Canary Deployment

```
v1.0.0: 95% traffic
v2.0.0: 5% traffic → Monitor metrics

If metrics OK:
  v1.0.0: 90% traffic
  v2.0.0: 10% traffic → Monitor

If metrics OK:
  v1.0.0: 50% traffic
  v2.0.0: 50% traffic → Monitor

If metrics OK:
  v2.0.0: 100% traffic

If metrics BAD:
  Rollback to v1.0.0: 100%
```

---

## 📊 Load Testing

```bash
# Using Apache Bench
ab -n 10000 -c 100 http://localhost:5000/api/media/trending

# Using wrk
wrk -t12 -c400 -d30s http://localhost:5000/api/media/trending

# Using k6
k6 run load-test.js
```

### Load Test Script (k6)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'],
    http_req_failed: ['<0.1']
  }
};

export default function () {
  let response = http.get('http://localhost:5000/api/media/trending');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200
  });
  
  sleep(1);
}
```

---

## 📋 Maintenance Schedule

### Daily
- Monitor error rates and latency
- Review logs for anomalies
- Check backup completion
- Monitor disk space

### Weekly
- Database optimization (ANALYZE, VACUUM)
- Review slow query logs
- Update security patches
- Load balancer status check

### Monthly
- Full database backup verification
- SSL certificate renewal check
- Capacity planning analysis
- Performance report generation

### Quarterly
- Disaster recovery drill
- Security audit
- Cost optimization review
- Architecture review

---

## 🔐 Production Best Practices

### Environment Management
```bash
# Never commit .env files
echo ".env" >> .gitignore
echo "*.pem" >> .gitignore

# Use separate .env for each environment
.env.development
.env.staging
.env.production

# Rotate secrets regularly
# Use secret management (AWS Secrets Manager, HashiCorp Vault)
```

### Database Management
```bash
# Automated backups
# AWS RDS: 7-day backup retention
# GCP Cloud SQL: Daily automated backups
# Azure: Geo-redundant backups

# Manual backup before major changes
mongodump --uri mongodb://... --out ./backup/$(date +%Y%m%d)
```

### Security Updates
```bash
# Regular dependency updates
npm audit
npm update
npm audit fix

# Review and test before deploying
git diff package.json
npm test
git push
```

---

This comprehensive guide covers all aspects of deployment and optimization for production readiness.
