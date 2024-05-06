import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getTasks, getTask, createTask, getUsers, createUser, updateTask, deleteTask } from './database.js';
const app = express();
app.use(express.json());
dotenv.config();

app.post('/register', async (req, res) => {
    var hashedPassword = await bcrypt.hashSync(req.body.password, 10);
    const { name } = req.body;
    const user = { name: name };

    if (!name || !hashedPassword) {
      return res.status(400).send("Name, password, and role are required.");
    }
    try {
      await createUser(name, hashedPassword);
      const accesstoken = jwt.sign({name}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
      res.json({ accesstoken: accesstoken });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
});
app.get("/profile", await authenticateToken,async (req, res) => {
    try {
    const users = await getUsers();
    const user = users.filter(user => user.name === req.user.name);
            if (!user) {
            return res.status(404).send("User not found");
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).send("Internal Server Error");
    }
});
app.post('/login', async (req, res) => {
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

app.get('/tasks', await authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id; // Extract user ID from JWT token
      const tasks = await getTasks(userId); // Get tasks for the authenticated user
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).send("Internal Server Error");
    }
});
app.post('/create', await authenticateToken, async (req, res) => {
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
app.put('/update/:id', await authenticateToken, async (req, res) => {
    const { title, status } = req.body;
    const taskId = req.params.id;
    const taskInfo = await getTask(taskId);
    if(req.user.id !== taskInfo.user_id){
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
app.delete('/delete/:id', await authenticateToken, async (req, res) => {
    const taskId = req.params.id;
    const taskInfo = await getTask(taskId);
    if(req.user.id !== taskInfo.user_id){
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
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(4000, () => {
    console.log('Server is running at port 4000');
});