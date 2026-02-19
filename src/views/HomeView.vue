<script setup lang="ts">
import { ref } from "vue"
import { Turnstile } from "@sctg/turnstile-vue3"

const siteKey = "0x4AAAAAACeij_Rbg6tsjrTT"
const token = ref<string>("")
const name = ref<string>("")
const email = ref<string>("")
const message = ref<string>("")

const handleSubmit = async () => {
  if (!token.value) {
    alert("Please verify first")
    return
  }

  const res = await fetch("https://contact-worker.fiveword2.workers.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: token.value,
      name: name.value,
      email: email.value,
      message: message.value,
    }),
  })

  const data: { success: boolean } = await res.json()

  if (data.success) alert("Message sent to Telegram ✅")
  else alert("Verification failed ❌")
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 p-4">
    <input v-model="name" placeholder="Name" required class="border p-2 w-full"/>
    <input v-model="email" type="email" placeholder="Email" required class="border p-2 w-full"/>
    <textarea v-model="message" placeholder="Message" required class="border p-2 w-full"/>
    <Turnstile :site-key="siteKey" v-model="token"/>
    <button type="submit" class="bg-blue-500 text-white px-4 py-2 w-full">Submit</button>
  </form>
</template>
