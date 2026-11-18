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

  const headers = { ...event.headers };
  delete headers.host;
  delete headers['content-length'];

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers,
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
      body: JSON.stringify({ error: err.message }),
    };
  }
};