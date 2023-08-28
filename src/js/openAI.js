const express = require("express");
const { OpenAIAPI } = require("openai");
const app = express();
const openai = new OpenAIAPI({ key: "your-openai-api-key" });

app.post("/api/query", async (req, res) => {
  const prompt = req.body.prompt; // Get the prompt from the client-side
  const maxTokens = 100; // Limit response length

  const apiResponse = await openai.createCompletion({
    prompt: prompt,
    max_tokens: maxTokens,
  });

  res.send(apiResponse.choices[0].text);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
