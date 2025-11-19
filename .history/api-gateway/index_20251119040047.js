const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');

const app = express();

// 1. Proxy Routes (Forward traffic to microservices)
// Any request to /api/v1/auth/* goes to auth-service
app.use('/api/v1/auth', createProxyMiddleware({ 
    target: 'http://auth-service:3001', 
    changeOrigin: true 
}));

// Any request to /api/v1/tools/* goes to url-builder-service
app.use('/api/v1/tools', createProxyMiddleware({ 
    target: 'http://url-builder-service:3002', 
    changeOrigin: true 
}));

// 2. Proxy Swagger JSONs (So the browser can fetch them via the Gateway)
app.use('/docs/auth/json', createProxyMiddleware({ 
    target: 'http://auth-service:3001/swagger.json', 
    changeOrigin: true,
    pathRewrite: { '^/docs/auth/json': '' } 
}));

app.use('/docs/tools/json', createProxyMiddleware({ 
    target: 'http://url-builder-service:3002/swagger.json', 
    changeOrigin: true,
    pathRewrite: { '^/docs/tools/json': '' } 
}));

// 3. Unified Swagger UI
// This creates a dropdown menu to switch between services
const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
        urls: [
            { url: '/docs/auth/json', name: 'Auth Service' },
            { url: '/docs/tools/json', name: 'URL Builder Service' }
        ]
    }
};

app.use('/', swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));

app.listen(3000, () => {
    console.log('🚀 API Gateway running on http://localhost:3000');
});