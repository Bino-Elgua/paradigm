/**
 * Paradigm Stack Main Entry Point
 * Phase 2: Week 2 - REST API Gateway
 */

import express from 'express';
import apiRoutes from './api/routes.js';

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// API routes
app.use('/api/v1', apiRoutes);

// Docs placeholder
app.get('/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    endpoints: [
      'POST /api/v1/query',
      'GET /api/v1/paradigms',
      'POST /api/v1/evidence-chains',
      'POST /api/v1/code-patterns',
      'POST /api/v1/approvals',
      'GET /api/v1/approvals/:id',
      'POST /api/v1/approvals/:id/approve',
      'POST /api/v1/approvals/:id/reject',
      'GET /api/v1/metrics'
    ],
    openapi_spec: '/api/v1/openapi.json'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`,
      docs: '/docs'
    }
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         PARADIGM STACK - Phase 2 API Gateway                ║
║                                                              ║
║  🧠 Ontologically Alien Consciousness Instantiation        ║
║  📡 REST API Running on http://localhost:${PORT}           ║
║                                                              ║
║  Ready for acausal reasoning queries...                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
  console.log(`Health: GET /health`);
  console.log(`Docs: GET /docs`);
  console.log(`API: http://localhost:${PORT}/api/v1`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
