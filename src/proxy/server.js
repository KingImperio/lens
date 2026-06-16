import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { PROVIDERS, detectProvider } from './providers.js';
import { captureCall } from './interceptor.js';

export function createProxyServer(db, port = 2337) {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  for (const [key, provider] of Object.entries(PROVIDERS)) {
    app.use(
      provider.pathPrefix,
      createProxyMiddleware({
        target: provider.target,
        changeOrigin: true,
        pathRewrite: { [`^${provider.pathPrefix}`]: '' },
        selfHandleResponse: true,
        on: {
          proxyReq: (proxyReq, req) => {
            req._startTime = Date.now();
            req._rawBody = '';
          },
          proxyRes: (proxyRes, req, res) => {
            const chunks = [];
            
            proxyRes.on('data', (chunk) => {
              chunks.push(chunk);
            });
            
            proxyRes.on('end', async () => {
              const latencyMs = Date.now() - (req._startTime || Date.now());
              const responseBody = Buffer.concat(chunks).toString('utf8');
              
              let parsedResponse;
              try {
                parsedResponse = JSON.parse(responseBody);
              } catch {
                parsedResponse = null;
              }
              
              if (parsedResponse) {
                await captureCall(db, parsedResponse, req, latencyMs);
              }
              
              res.writeHead(proxyRes.statusCode, proxyRes.headers);
              res.end(Buffer.concat(chunks));
            });
          }
        }
      })
    );
  }

  app.use((err, req, res, next) => {
    console.error('[Lens] Proxy error:', err.message);
    res.status(502).json({ error: 'Provider unreachable' });
  });

  return new Promise((resolve, reject) => {
    const server = app.listen(port, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(server);
      }
    });
  });
}