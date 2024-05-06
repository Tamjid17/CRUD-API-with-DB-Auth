import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getTasks, getTask, createTask, getUsers } from './database.js';
const app = express();
app.use(express.json());
dotenv.config();

const users = await getUsers();
app.get('/users', await authenticateToken, async (req, res) => {
    const users = await getUsers();
    //res.send(users);
    res.json(users.filter(user => user.Name === req.user.name));
});
app.post('/login', async (req, res) => {
    const username = req.body.username;
    const user = { name: username };
    const accesstoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accesstoken: accesstoken });
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
app.get('/tasks', async (req, res) => {
    const tasks = await getTasks();
    res.send(tasks);
});
// app.get('/tasks/:id', async (req, res) => {
//     const task = await getTask(req.params.id);
//     res.send(task);
// });
// app.post('/tasks', async (req, res) => {
//     const { title, status } = req.body;
//     const task = await createTask(title, status);
//     res.status(201).send(task);
// });
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => {
    console.log('Server is running at port 3000');
});