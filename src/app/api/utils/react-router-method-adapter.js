function methodNotAllowed(allowMethods) {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      Allow: allowMethods.join(', '),
    },
  });
}

function invoke(handler, request, params) {
  return handler(request, { params });
}

/**
 * Adapts route modules that export HTTP method functions (GET/POST/PUT/PATCH/DELETE)
 * so they can run as React Router resource routes (loader/action).
 */
export function createRouteHandlers(handlers) {
  const allow = Object.entries(handlers)
    .filter(([, handler]) => typeof handler === 'function')
    .map(([method]) => method.toUpperCase());

  const loader = async ({ request, params }) => {
    const method = request.method.toUpperCase();
    const getHandler = handlers.GET;
    if ((method !== 'GET' && method !== 'HEAD') || typeof getHandler !== 'function') {
      return methodNotAllowed(allow);
    }
    return invoke(getHandler, request, params);
  };

  const action = async ({ request, params }) => {
    const method = request.method.toUpperCase();
    const handler = handlers[method];
    if (typeof handler !== 'function') {
      return methodNotAllowed(allow);
    }
    return invoke(handler, request, params);
  };

  return { loader, action };
}
