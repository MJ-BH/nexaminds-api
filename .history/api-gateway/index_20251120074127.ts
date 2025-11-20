import express, { Application, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import swaggerUi from 'swagger-ui-express';

const app: Application = express();
const PORT = 3000;

// Helper to define Proxy Options
// We remove the explicit 'Options' return type to prevent TS conflict
const proxyConfig = (target: string, pathRewrite?: { [key: string]: string }) => ({
    target,
    changeOrigin: true,
    pathRewrite,
    // We type specific arguments as 'any' to avoid compatibility issues between http-proxy and express
    onError: (err: any, req: any, res: any) => {
        console.error(`Proxy Error to ${target}:`, err);
        res.status(503).json({ 
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
// We cast to 'any' because the library types are strict about http vs express request objects
app.use('/api/v1/auth', createProxyMiddleware(proxyConfig('http://auth-service:3001') as any));

// URL BUILDER SERVICE
app.use('/api/v1/tools', createProxyMiddleware(proxyConfig('http://url-builder-service:3002') as any));

// EMAIL SERVICE
app.use('/api/v1/email', createProxyMiddleware(
    proxyConfig('http://email-service:3003', { '^/api/v1/email': '' }) as any
));

/**
 * ========================================================================
 *  2. SWAGGER JSON PROXIES
 * ========================================================================
 */

// Auth Docs
app.use('/docs/auth/json', createProxyMiddleware(
    proxyConfig('http://auth-service:3001/swagger.json', { '^/docs/auth/json': '' }) as any
));

// URL Builder Docs
app.use('/docs/tools/json', createProxyMiddleware(
    proxyConfig('http://url-builder-servi