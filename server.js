import express from "express";
import dotenv from "dotenv";
import userRouter from "./userOperations.js";
import adminRouter from "./adminOperations.js";
import { createUser, getUsers } from "./database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./authMiddleware.js";

dotenv.config();
const app = express();
app.use(express.json());


// API for user registration
app.post("/register", async (req, res) => {
  var hashedPassword = await bcrypt.hashSync(req.body.password, 10);
  const { name } = req.body;
  const user = { name: name };

  if (!name || !hashedPassword) {
    return res.status(400).send("Name and password are required.");
  }
  try {
    await createUser(name, hashedPassword);
    const accesstoken = jwt.sign({ name }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    res.json({ accesstoken: accesstoken });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});


// API for login functionality
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const users = await getUsers();
    const user = users.filter((user) => user.name === req.user.name);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Internal Server Error");
  }
});


// Mounting routers to base path
app.use("/", userRouter); 
app.use("/", adminRouter);


// Creation of server at port 4000
app.listen(4000, () => {
  console.log("Server is running at port 4000");
});
