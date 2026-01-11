import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.post("/api/translate", async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing 'text' or 'targetLang'" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text into ${targetLang}.`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const choice = response.data?.choices?.[0]?.message?.content;

    if (!choice) {
      throw new Error("No translation returned from OpenAI.");
    }

    res.status(200).json({ translatedText: choice.trim() });
  } catch (error) {
    console.error("Translation error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to translate text." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
