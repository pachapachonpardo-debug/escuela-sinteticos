exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  const path = event.path.replace(/^\/\.netlify\/functions\/proxy/, '');
  const query = event.rawQuery ? `?${event.rawQuery}` : '';
  const targetUrl = `https://znmkhayvymsvymympdtsm.supabase.co${path}${query}`;

  const cleanHeaders = {};
  const allowed = ['apikey', 'authorization', 'content-type', 'x-client-info', 'prefer', 'range'];
  for (const key of allowed) {
    if (event.headers[key]) cleanHeaders[key] = event.headers[key];
  }

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: cleanHeaders,
      body: ['GET', 'HEAD'].includes(event.httpMethod) ? undefined : event.body,
    });

    const text = await response.text();
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message, cause: err.cause ? String(err.cause) : null }),
    };
  }
};
