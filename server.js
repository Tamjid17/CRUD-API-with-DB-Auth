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
// API for user registration
app.post("/register", async (req, res) => {
  var hashedPassword = await bcrypt.hashSync(req.body.password, 10);
  const { name, email } = req.body;
  if (!name || !hashedPassword || !email) {
    return res.status(400).send("Name, email, and password are required.");
  }
  try {
    await createUser(name, hashedPassword, email);
    const users = await getUsers();
    const user = users.find((user) => user.name === name);
    const accessToken = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({ accessToken });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Internal Server Error: " + error.message);
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
