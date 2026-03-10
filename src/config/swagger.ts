import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

function loadSpec(): Record<string, unknown> {
  const specPath = path.join(__dirname, 'openapi.yaml');
  const raw = fs.readFileSync(specPath, 'utf8');
  return yaml.load(raw) as Record<string, unknown>;
}

/**
 * Returns an Express router that serves:
 *   GET /docs        → Swagger UI
 *   GET /docs.json   → Raw OpenAPI JSON spec
 */
export function createSwaggerRouter(): Router {
  const spec = loadSpec();
  const router = Router();

  // Raw spec as JSON (handy for tooling / import into Postman etc.)
  router.get('/docs.json', (_, res) => res.json(spec));

  // Swagger UI
  router.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: 'Time Recording API',
      customCss: `
        .swagger-ui .topbar { background-color: #1a1a2e; }
        .swagger-ui .topbar .link { visibility: hidden; }
      `,
      swaggerOptions: {
        docExpansion: 'list',       // collapse individual operations by default
        filter: true,               // enable the search/filter bar
        persistAuthorization: true,
      },
    })
  );

  return router;
}
