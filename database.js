import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

// MYSQL DBMS connection pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE
}).promise();


// Query function for getting all tasks of an user
export async function getTasks(id) {
    const [rows] = await pool.query('SELECT id, title, status FROM tasks WHERE user_id = ?', [id]);
    return rows;
}


// Query function for getting all tasks in the database
export async function getAllTasks() {
    const [rows] = await pool.query('SELECT * FROM tasks');
    return rows;
}


// Query function for getting a task by id
export async function getTask(id) {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    return rows[0];
}


// Query function for updating a task by id
export async function updateTask(id, title, status) {
    if (!title && !status) {
      throw new Error("Either title or status must be provided for update");
    }
     try {
       if (!title) {
         await pool.query("UPDATE tasks SET status = ? WHERE id = ?", [
           status,
           id,
         ]);
       } else if (!status) {
         await pool.query("UPDATE tasks SET title = ? WHERE id = ?", [
           title,
           id,
         ]);
       } else {
         await pool.query(
           "UPDATE tasks SET title = ?, status = ? WHERE id = ?",
           [title, status, id]
         );
       }

       return getTask(id);
     } catch (error) {
       console.error("Error updating task:", error);
       throw new Error("Error updating task");
     }
}


// Query function for creating a task
export async function createTask(userID, title, status) {
    const [result] = await pool.query('INSERT INTO tasks (user_id, title, status) VALUES(?, ?, ?)', [userID, title, status]);
    return getTask(result.insertId);
}


// Query function for getting all users
export async function getUsers() {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
}


// Query function for creating a user
export async function createUser(username, password, email) {
  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, password, email) VALUES(?, ?, ?)",
      [username, password, email]   
    );
    console.log("User created successfully");
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
  
}


// Query function for deleting a task by id
export async function deleteTask(id) {
  try {
    await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}


// Query function for deleting a user by id
export async function deleteUser(id) {
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}


// Query function for updating a user profile by id
export async function updateUser(name, password, email, id) {
  try {
    await pool.query("UPDATE users SET name = ?, password = ?, email = ? WHERE id = ?", [name, password, email, id]);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}