require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// API endpoint for generating responses
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Validate messages input
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Invalid request: 'messages' must be a non-empty array.",
        status: "error",
      });
    }

    // Create prompt context
    const promptContext = messages.map((msg) => msg.content).join("\n");

    // Generate response
    const result = await model.generateContent(promptContext);

    // Check if response structure exists
    const responseText =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated";

    res.json({
      response: responseText,
      status: "success",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: error.message,
      status: "error",
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
