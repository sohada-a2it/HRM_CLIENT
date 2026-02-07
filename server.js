// server.js - Hostinger optimized
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Hostinger environment variables
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Hostinger requires 0.0.0.0
const isProduction = process.env.NODE_ENV === 'production';

console.log('🚀 Starting Next.js server...');
console.log('Environment:', isProduction ? 'Production' : 'Development');
console.log('Port:', PORT);
console.log('Host:', HOST);

const app = next({
  dev: !isProduction,
  hostname: HOST,
  port: PORT,
  dir: __dirname // Ensure it runs from current directory
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;
      
      // Log all requests (for debugging)
      console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);
      
      // =========== HANDLE SPECIAL REQUESTS ===========
      
      // 1. Handle HEAD requests (403 ফিক্সের জন্য)
      if (req.method === 'HEAD') {
        console.log('✅ Handling HEAD request for:', pathname);
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Cache-Control': 'no-cache'
        });
        res.end();
        return;
      }
      
      // 2. Handle OPTIONS (CORS preflight)
      if (req.method === 'OPTIONS') {
        res.writeHead(200, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400'
        });
        res.end();
        return;
      }
      
      // 3. Handle health check
      if (pathname === '/health' || pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          env: process.env.NODE_ENV
        }));
        return;
      }
      
      // 4. Default Next.js handling
      handle(req, res, parsedUrl);
      
    } catch (error) {
      console.error('❌ Server error:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });
  
  server.listen(PORT, HOST, (err) => {
    if (err) {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    }
    console.log(`✅ Server running at http://${HOST}:${PORT}`);
    console.log(`✅ Health check: http://${HOST}:${PORT}/health`);
  });
  
}).catch((error) => {
  console.error('❌ Next.js preparation failed:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  process.exit(0);
});