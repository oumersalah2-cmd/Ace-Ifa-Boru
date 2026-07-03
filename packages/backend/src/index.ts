// backend/src/index.ts
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import examRoutes from "./routes/exam.routes";
import paywallRoutes from "./routes/paywall.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { bot } from "./bot";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Register routes
app.use(authRoutes);
app.use(examRoutes);
app.use(paywallRoutes);
app.use(analyticsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);

  // Start the grammY Telegram bot asynchronously if configured
  if (bot) {
    bot.start({
      onStart(botInfo) {
        console.log(`Telegram Bot @${botInfo.username} is running...`);
      },
    }).catch((err) => {
      console.error("Failed to start Telegram Bot:", err);
    });
  }
});
