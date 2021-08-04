/* Step 1: Domain name */
const MY_DOMAIN = 'next.seongland.com'
const ANOTHER = 'seongland-seonglae.cloud.okteto.net'

/* CONFIGURATION ENDS HERE */
addEventListener('fetch', (event) => {
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
    return new Response(null, {
      headers: corsHeaders,
    })
  }
  // Handle standard OPTIONS request.
  else
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, POST, PUT, OPTIONS',
      },
    })
}

async function fetchAndApply(request: Request) {
  if (request.method === 'OPTIONS') return handleOptions(request)

  let url = new URL(request.url)
  url.hostname = ANOTHER

  let response
  if (url.pathname.endsWith('js')) {
    response = await fetch(url.toString())
    let body = await response.text()
    response = new Response(
      body.replace(String.raw`/${ANOTHER}/g`, MY_DOMAIN),
      response,
    )
    response.headers.set('Content-Type', 'application/x-javascript')
    return response
  } else if (
    url.pathname.startsWith('/api') &&
    !url.pathname.endsWith('robots.txt') &&
    !url.pathname.endsWith('sitemap.xml')
  ) {
    response = await fetch(url.toString(), {
      body: request.body,
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
      },
      method: 'POST',
    })
    response = new Response(response.body, response)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } else {
    response = await fetch(url.toString(), {
      body: request.body,
      headers: request.headers,
      method: request.method,
    })
    response = new Response(response.body, response)
    response.headers.delete('Content-Security-Policy')
    response.headers.delete('X-Content-Security-Policy')
  }

  return appendJavascript(response)
}

class MetaRewriter {
  element(element: HTMLElement) {
    if (
      element.getAttribute('property') === 'og:url' ||
      element.getAttribute('name') === 'twitter:url'
    )
      element.setAttribute('content', MY_DOMAIN)
    if (element.getAttribute('name') === 'apple-itunes-app') element.remove()
  }
}

class HeadRewriter {
  element(element: HTMLElement) {}
}

class BodyRewriter {
  constructor() {}
  element(element: HTMLElement) {}
}

async function appendJavascript(res: Response) {
  return new HTMLRewriter()
    .on('title', new MetaRewriter())
    .on('meta', new MetaRewriter())
    .on('head', new HeadRewriter())
    .on('body', new BodyRewriter())
    .transform(res)
}
