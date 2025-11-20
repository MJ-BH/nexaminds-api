const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;

/**
 * ========================================================================
 *  1. API ROUTE PROXIES
 *  Forward requests from Gateway (3000) to Internal Services (3001, 3002, 3003)
 * ========================================================================
 */

// AUTH SERVICE
// Incoming: http://localhost:3000/api/v1/auth/*
// Outgoing: http://auth-service:3001/api/v1/auth/*
app.use('/api/v1/auth', createProxyMiddleware({ 
    target: 'http://auth-service:3001', 
    changeOrigin: true,
    onError: (err, req, res) => res.status(503).json({ error: 'Auth Service Unavailable' })
}));

// URL BUILDER SERVICE
// Incoming: http://localhost:3000/api/v1/tools/*
// Outgoing: http://url-builder-service:3002/api/v1/tools/*
app.use('/api/v1/tools', createProxyMiddleware({ 
    target: 'http://url-builder-service:3002', 
    changeOrigin: true,
    onError: (err, req, res) => res.status(503).json({ error: 'URL Builder Service Unavailable' })
}));

// EMAIL SERVICE
// Incoming: http://localhost:3000/api/v1/email/*
// Outgoing: http://email-service:3003/*
// Note: We use pathRewrite because the Email Service listens on '/' (e.g., /send), not /api/v1/email
app.use('/api/v1/email', createProxyMiddleware({ 
    target: 'http://email-service:3003', 
    changeOrigin: true,
    pathRewrite: { '^/api/v1/email': '' },
    onError: (err, req, res) => res.status(503).json({ error: 'Email Service Unavailable' })
}));


/**
 * ========================================================================
 *  2. SWAGGER JSON PROXIES
 *  Fetch the raw 'swagger.json' from each service to build the UI
 * ========================================================================
 */

// Auth Service Docs
app.use('/docs/auth/json', createProxyMiddleware({ 
    target: 'http://auth-service:3001/swagger.json', 
    changeOrigin: true,
    pathRewrite: { '^/docs/auth/json': '' } 
}));

// URL Builder Docs
app.use('/docs/tools/json', createProxyMiddleware({ 
    target: 'http://url-builder-service:3002/swagger.json', 
    changeOrigin: true,
    pathRewrite: { '^/docs/tools/json': '' } 
}));

// Email Service Docs
app.use('/docs/email/json', createProxyMiddleware({ 
    target: 'http://email-service:3003/swagger.json', 
    changeOrigin: true,
    pathRewrite: { '^/docs/email/json': '' } 
}));


/**
 * ========================================================================
 *  3. UNIFIED SWAGGER UI
 *  Combines all 3 JSON sources into one Dropdown Menu
 * ========================================================================
 */
const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
        urls: [
            { url: '/docs/auth/json', name: 'Auth Service' },
            { url: '/docs/tools/json', name: 'URL Builder Service' },
            { url: '/docs/email/json', name: 'Email Service' }
        ]
    }
};

// Serve the UI at the root URL
app.use('/', swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));


/**
 * ========================================================================
 *  START SERVER
 * ========================================================================
 */
app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
    console.log(`📄 Unified Documentation available at http://localhost:${PORT}`);
});