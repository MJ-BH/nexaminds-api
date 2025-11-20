import express, { Application, Request, Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import swaggerUi from 'swagger-ui-express';

const app: Application = express();
const PORT = 3000;

// Helper to define Proxy Options with Error Handling
const proxyConfig = (target: string, pathRewrite?: { [key: string]: string }): Options => ({
    target,
    changeOrigin: true,
    pathRewrite,
    onError: ( : Error, req, res) => {
        console.error(`Proxy Error to ${target}:`, err);
        // We need to cast res because Proxy types can be tricky
        (res as Response).status(503).json({ 
            error: 'Service Unavailable', 
            details: `Could not connect to ${target}` 
        });
    }
});

/**
 * ========================================================================
 *  1. API ROUTE PROXIES
 * ========================================================================
 */

// AUTH SERVICE
// We forward full path (no rewrite) because we fixed Auth Service to listen on root
app.use('/api/v1/auth', createProxyMiddleware(proxyConfig('http://auth-service:3001')));

// URL BUILDER SERVICE
app.use('/api/v1/tools', createProxyMiddleware(proxyConfig('http://url-builder-service:3002')));

// EMAIL SERVICE
// Email service listens on root (e.g. /send), so we strip the prefix
app.use('/api/v1/email', createProxyMiddleware(
    proxyConfig('http://email-service:3003', { '^/api/v1/email': '' })
));

/**
 * ========================================================================
 *  2. SWAGGER JSON PROXIES
 * ========================================================================
 */

// Auth Docs
app.use('/docs/auth/json', createProxyMiddleware(
    proxyConfig('http://auth-service:3001/swagger.json', { '^/docs/auth/json': '' })
));

// URL Builder Docs
app.use('/docs/tools/json', createProxyMiddleware(
    proxyConfig('http://url-builder-service:3002/swagger.json', { '^/docs/tools/json': '' })
));

// Email Service Docs
app.use('/docs/email/json', createProxyMiddleware(
    proxyConfig('http://email-service:3003/swagger.json', { '^/docs/email/json': '' })
));

/**
 * ========================================================================
 *  3. UNIFIED SWAGGER UI
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

app.use('/', swaggerUi.serve, swaggerUi.setup(undefined, swaggerOptions));

/**
 * ========================================================================
 *  START SERVER
 * ========================================================================
 */
app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
    console.log(`📄 Unified Documentation available at http://localhost:${PORT}`);
});