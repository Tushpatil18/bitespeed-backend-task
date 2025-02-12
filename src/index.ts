import express from "express";
import identifyRoutes from "./routes/identify";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// API routes
app.use("/api", identifyRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
