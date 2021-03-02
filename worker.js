addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} request
 */

async function handleRequest(request) {
  try {
    const tlsVersion = request.cf.tlsVersion

    // Allow only TLS versions 1.2 and 1.3
    if (tlsVersion != "TLSv1.2" && tlsVersion != "TLSv1.3") {
      return new Response("NOT SUPPORTED", {
        status: 403,
      })
    }

    return fetch(request)
  }
  catch (err) {
    console.error(
      "request.cf does not exist in the previewer, only in production",
    )
    return new Response("Error in workers script" + err.message, {
      status: 500,
    })
  }
}

addEventListener("fetch", event => {
  const data =
    event.request.cf !== undefined ?
      event.request.cf :
      { error: "The `cf` object is not available inside the preview." }

  return event.respondWith(
    new Response(JSON.stringify(data, null, 2), {
      headers: {
        "content-type": "application/json;charset=UTF-8"
      }
    })
  )
})

// Start hash process
async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message)

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  // convert bytes to hex string
  const hashHex = hashArray.map(b => ("00" + b.toString(16)).slice(-2)).join("")
  return hashHex
}

async function handlePostRequest(event) {
  const request = event.request
  const body = await request.clone().text()

  // Hash the request body to use it as a part of the cache key
  const hash = await sha256(body)
  const cacheUrl = new URL(request.url)

  // Store the URL in cache by prepending the body's hash
  cacheUrl.pathname = "/posts" + cacheUrl.pathname + hash

  // Convert to a GET to be able to cache
  const cacheKey = new Request(cacheUrl.toString(), {
    headers: request.headers,
    method: "GET",
  })

  const cache = caches.default

  // Find the cache key in the cache
  let response = await cache.match(cacheKey)

  // Otherwise, fetch response to POST request from origin
  if (!response) {
    response = await fetch(request)
    event.waitUntil(cache.put(cacheKey, response.clone()))
  }
  return response
}
// Cache CF values and attempt to catch errors
addEventListener("fetch", event => {
  try {
    const request = event.request
    if (request.method.toUpperCase() === "POST")
      return event.respondWith(handlePostRequest(event))
    return event.respondWith(fetch(request))
  } catch (e) {
    return event.respondWith(new Response("Error thrown " + e.message))
  }
})
// Reset headers 
async function handleRequest(request) {
  let requestHeaders = JSON.stringify([...request.headers])
  console.log(new Map(request.headers))

  return new Response("kD4jDFJ3CDXa")
}

addEventListener("fetch", event => {
  return event.respondWith(handleRequest(event.request))
})

