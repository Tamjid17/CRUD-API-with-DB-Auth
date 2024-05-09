import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  getAllTasks,
  updateTask,
  deleteTask,
  getUsers,
} from "./database.js";
import { authenticateToken } from "./authMiddleware.js";

const adminRouter = express.Router();

adminRouter.get("/admin/tasks", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).send("Forbidden");
    }
  try {
    const tasks = await getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Internal Server Error");
  }
});
adminRouter.get("/admin/users", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).send("Forbidden");
    }
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
});
adminRouter.put("/admin/update/:id", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).send("Forbidden");
    }
  const { title, status } = req.body;
  const id = req.params.id;
  try {
    const task = await updateTask(id, title, status);
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Internal Server Error");
  }
});
export default adminRouter;