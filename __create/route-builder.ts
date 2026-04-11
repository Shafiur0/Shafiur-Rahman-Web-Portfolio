import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

const routeModuleLoaders = import.meta.glob('../src/app/api/**/route.{js,jsx,ts,tsx}');

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Helper function to transform file path to Hono route path
function getHonoPath(modulePath: string): { name: string; pattern: string }[] {
  const relativePath = modulePath
    .replace('../src/app/api/', '')
    .replace(/\/route\.[jt]sx?$/, '');

  if (relativePath === modulePath) {
    return [{ name: 'root', pattern: '' }];
  }

  const routeParts = relativePath.split('/').filter(Boolean);
  if (routeParts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }

  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

type RouteHandler = (
  request: Request,
  context: { params: Record<string, string> }
) => Promise<Response> | Response;
type RouteModule = Record<string, RouteHandler | unknown>;
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

// Import and register all routes
export async function registerRoutes() {
  const routeEntries = Object.entries(routeModuleLoaders)
    .slice()
    .sort((a, b) => b[0].length - a[0].length);

  // Clear existing routes
  api.routes = [];

  for (const [modulePath, loadRouteModule] of routeEntries) {
    try {
      const initialRoute = (await loadRouteModule()) as RouteModule;
      const parts = getHonoPath(modulePath);
      const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;

      for (const method of HTTP_METHODS) {
        try {
          if (typeof initialRoute[method] === 'function') {
            const handler: Handler = async (c) => {
              const routeModule = import.meta.env.DEV
                ? ((await loadRouteModule()) as RouteModule)
                : initialRoute;
              const routeHandler = routeModule[method];
              if (typeof routeHandler !== 'function') {
                return c.json({ error: 'Method not allowed' }, 405);
              }
              const params = c.req.param();
              return await routeHandler(c.req.raw, { params });
            };

            switch (method) {
              case 'GET':
                api.get(honoPath, handler);
                break;
              case 'POST':
                api.post(honoPath, handler);
                break;
              case 'PUT':
                api.put(honoPath, handler);
                break;
              case 'DELETE':
                api.delete(honoPath, handler);
                break;
              case 'PATCH':
                api.patch(honoPath, handler);
                break;
              default:
                break;
            }
          }
        } catch (error) {
          console.error(`Error registering route ${modulePath} for method ${method}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error importing route module ${modulePath}:`, error);
    }
  }
}

// Start initial route registration without top-level await.
const registerRoutesPromise = registerRoutes().catch((error) => {
  console.error('Error during initial route registration:', error);
});

// Hot reload routes in development
if (import.meta.env.DEV) {
  import.meta.glob('../src/app/api/**/route.{js,jsx,ts,tsx}', {
    eager: true,
  });
  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      registerRoutes().catch((err) => {
        console.error('Error reloading routes:', err);
      });
    });
  }
}

export { api, API_BASENAME, registerRoutesPromise };
