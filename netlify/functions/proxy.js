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

  const path = event.path.replace(/^(\/\.netlify\/functions\/proxy|\/api)/, '');
  const query = event.rawQuery ? `?${event.rawQuery}` : '';
  const targetUrl = `https://znmkhayvymsvmympdtsm.supabase.co${path}${query}`;

  const cleanHeaders = {};
  const allowed = ['apikey', 'authorization', 'content-type', 'x-client-info', 'prefer', 'range'];
  for (const [k, v] of Object.entries(event.headers || {})) {
    if (allowed.includes(k.toLowerCase())) {
      cleanHeaders[k.toLowerCase()] = v;
    }
  }

  let bodyData = undefined;
  if (!['GET', 'HEAD'].includes(event.httpMethod) && event.body) {
    bodyData = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
  }

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: cleanHeaders,
      body: bodyData,
    });

    const text = await response.text();
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: text || '{}',
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
