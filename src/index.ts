/* Step 1: Domain name */
const MY_DOMAIN = 'account.seongland.com'
const ANOTHER = 'accountland-seonglae.cloud.okteto.net'

/* CONFIGURATION ENDS HERE */
addEventListener('fetch', event => {
  const fetchEvent = event as FetchEvent
  fetchEvent.respondWith(fetchAndApply(fetchEvent.request))
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function handleOptions(request: Request) {
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    return new Response(null, { headers: corsHeaders })
  }
  // Handle standard OPTIONS request.
  else return new Response(null, { headers: { Allow: 'GET, HEAD, POST, PUT, OPTIONS' } })
}

async function fetchAndApply(request: Request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  request = new Request(request)
  request.headers.set('Host', MY_DOMAIN)

  let url = new URL(request.url)
  if (url.hostname === MY_DOMAIN) url.hostname = ANOTHER

  let response = await fetch(url.toString(), {
    body: request.body,
    headers: request.headers,
    method: request.method,
  })
  if (response.redirected) {
    const url = response.url.replaceAll(ANOTHER, MY_DOMAIN)
    return Response.redirect(url, 301)
  }
  response = new Response(response.body, response)
  response.headers.delete('Content-Security-Policy')
  response.headers.delete('X-Content-Security-Policy')

  return response
}
