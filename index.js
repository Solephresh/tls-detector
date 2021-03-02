addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with anything you'd like
 * @param {Request} request
 */
async function handleRequest(request) {
  return new Response('Response Here', {
    headers: { 'content-type': 'text/plain' },
  })
}
