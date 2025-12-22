import webpush from 'web-push'

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Subscribe endpoint
    if (req.method === 'POST' && url.pathname === '/api/push/subscribe') {
      try {
        const subscription = await req.json()
        const userId = url.searchParams.get('userId') || 'anonymous'
        
        await env.PUSH_SUBSCRIPTIONS.put(
          `sub:${userId}`,
          JSON.stringify(subscription)
        )

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }
    }

    // Send notification endpoint
    if (req.method === 'POST' && url.pathname === '/api/push/send') {
      try {
        const { userId, title, body, data } = await req.json()

        webpush.setVapidDetails(
          env.VAPID_SUBJECT,
          env.VAPID_PUBLIC_KEY,
          env.VAPID_PRIVATE_KEY
        )

        const subData = await env.PUSH_SUBSCRIPTIONS.get(`sub:${userId}`)
        if (!subData) {
          return new Response(JSON.stringify({ error: 'No subscription found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          })
        }

        const subscription = JSON.parse(subData)
        const payload = JSON.stringify({ title, body, data })

        await webpush.sendNotification(subscription, payload)

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }
    }

    // Broadcast to all users
    if (req.method === 'POST' && url.pathname === '/api/push/broadcast') {
      try {
        const { title, body, data } = await req.json()

        webpush.setVapidDetails(
          env.VAPID_SUBJECT,
          env.VAPID_PUBLIC_KEY,
          env.VAPID_PRIVATE_KEY
        )

        const list = await env.PUSH_SUBSCRIPTIONS.list()
        const payload = JSON.stringify({ title, body, data })

        const results = await Promise.allSettled(
          list.keys.map(async (key) => {
            const subData = await env.PUSH_SUBSCRIPTIONS.get(key.name)
            const subscription = JSON.parse(subData)
            return webpush.sendNotification(subscription, payload)
          })
        )

        const sent = results.filter(r => r.status === 'fulfilled').length

        return new Response(JSON.stringify({ success: true, sent }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }
    }

    return new Response('DevSocial Push Service', {
      headers: corsHeaders
    })
  }
}
