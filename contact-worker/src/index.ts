export interface Env {
  TURNSTILE_SECRET: string
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_CHAT_ID: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 })
    }

    try {
      const body = await request.json()
      const { token, name, email, message } = body as {
        token: string
        name: string
        email: string
        message: string
      }

      if (!token || !name || !email || !message) {
        return new Response(JSON.stringify({ success: false }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }

      // 1️⃣ Verify Turnstile
      const formData = new URLSearchParams()
      formData.append("secret", env.TURNSTILE_SECRET)
      formData.append("response", token)

      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        { method: "POST", body: formData }
      )

      const verifyJson = (await verifyRes.json()) as { success: boolean }
      if (!verifyJson.success) {
        return new Response(JSON.stringify({ success: false }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }

      // 2️⃣ Send to Telegram
      const text = `New Contact Form Submission:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`

      await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
        }
      )

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  },
}
