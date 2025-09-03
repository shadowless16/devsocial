import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com", // OpenAI-compatible endpoint
});

async function run() {
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: "Hello from Ak David's DevSocial project!" }],
  });

  console.log(response.choices[0].message.content);
}

run();
