require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set. Copy .env.example to .env and set it.");
  process.exit(1);
}

const app = express();
app.use(
  helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }),
);
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : true,
  }),
);
app.use(express.json({ limit: "1mb" }));

const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/enrollments", require("./routes/enrollments"));
app.use("/api/students", require("./routes/students"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api", require("./routes/modules"));
app.use("/api", require("./routes/assignments"));
app.use("/api", require("./routes/submissions"));
app.use("/api", notFound);

// In production the API also serves the built React app (single-service deployment).
const dist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() =>
    app.listen(PORT, () =>
      console.log(`LMS API running on http://localhost:${PORT}`),
    ),
  )
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });

module.exports = app;
