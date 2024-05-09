import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Importing query functions from database.js
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getUsers,
  updateUser
} from "./database.js";

// Importing authorization middleware
import { authenticateToken } from "./authMiddleware.js";

const userRouter = express.Router();


// API for user registration
userRouter.post("/login", authenticateToken, async (req, res) => {
  const { name, password } = req.body;
  const users = await getUsers();
  const user = users.find((user) => user.name === name);
  if (!user) {
    return res.status(404).send("User not found");
  }

  try {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send("Invalid password");
    }
    // Generate JWT token
    const accessToken = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ accessToken });
  } catch (error) {
    console.error("Error generating access token:", error);
    res.status(500).send("Internal Server Error");
  }
});


// API for fetching all tasks of an user
userRouter.get("/tasks", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await getTasks(userId);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Internal Server Error");
  }
});


// API for creating a task
userRouter.post("/create", authenticateToken, async (req, res) => {
  const { title, status } = req.body;
  const userId = req.user.id;
  try {
    const task = await createTask(userId, title, status);
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send("Internal Server Error");
  }
});


// API for updating a task
userRouter.put("/update/:id", authenticateToken, async (req, res) => {
  const { title, status } = req.body;
  const taskId = req.params.id;
  const taskInfo = await getTask(taskId);
  if (req.user.id !== taskInfo.user_id) {
    return res.status(403).send("Forbidden");
  }
  try {
    const task = await updateTask(taskId, title, status);
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Internal Server Error");
  }
});


// API for updating user profile
userRouter.put("/update/profile", authenticateToken, async (req, res) => {
    const {name, password, email } = req.body;
    const id = req.user.id; 
  try {
    const users = await getUsers();
    const user = users.filter((user) => user.name === req.user.name);
    if (!user) {
      return res.status(404).send("User not found");
    }
    const hashedPassword = await bcrypt.hashSync(password, 10);
    await updateUser(name, hashedPassword, email, id);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Internal Server Error");
  }
});


// API for deleting a task
userRouter.delete("/delete/:id", authenticateToken, async (req, res) => {
  const taskId = req.params.id;
  const taskInfo = await getTask(taskId);
  if (req.user.id !== taskInfo.user_id) {
    return res.status(403).send("Forbidden");
  }
  try {
    await deleteTask(taskId);
    const tasks = await getTasks(req.user.id);
    res.json(tasks);
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default userRouter; // Exporting userRouter to use in server.js
