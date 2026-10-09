
import express from "express";
import cors from "cors";
import { projects } from "./data/projects.js";
import { detectConflicts } from "./ConflictEngine.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    project: "CivicSync",
    message: "CivicSync backend is running"
  });
});

// Get all public-works projects
app.get("/api/projects", (req, res) => {
  res.json({
    success: true,
    count: projects.length,
    data: projects
  });
});

// Get detected conflicts
app.get("/api/conflicts", (req, res) => {
  const conflicts = detectConflicts(projects);

  res.json({
    success: true,
    count: conflicts.length,
    data: conflicts
  });
});

// Get one project
app.get("/api/projects/:id", (req, res) => {
  const project = projects.find(
    (item) => item.id === req.params.id
  );

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found"
    });
  }

  res.json({
    success: true,
    data: project
  });
});

app.listen(PORT, () => {
  console.log(`CivicSync API running on port ${PORT}`);
});