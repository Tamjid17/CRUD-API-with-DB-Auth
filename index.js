const express = require("express");
const { status } = require("express/lib/response");
const app = express();
app.use(express.json());
const port = process.env.port || 4000;

const todos = [
  { id: 5, task: "Buying groceries", status: "Completed" },
  { id: 2, task: "Doing homeworks", status: "To Do" },
  { id: 4, task: "Watering plants", status: "In progress" },
  { id: 1, task: "Washing dishes", status: "To Do" },
  { id: 3, task: "Reciting the Quran", status: "Completed" },
  { id: 6, task: "Paying utility bills", status: "In progress" },
];


app.get("/", (req, res) => {
  res.send("Welcome to TODO List API");
});

app.get("/todos", (req, res) => {
  res.send(todos);
});
app.get("/todos/sort", (req, res) => {

  const sortBy = req.query.sortBy;
  let sortedTodos = todos;

  if (sortBy === "id") sortedTodos.sort((a, b) => a.id - b.id);
  else if (sortBy === "status")
    sortedTodos.sort((a, b) => b.status.localeCompare(a.status));
  else
    sortedTodos.sort((a, b) => a.id - b.id);
  res.send(sortedTodos);
});

app.get("/todos/search", (req, res) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).send("Search term is required.");
  }

  const searchTerm = search.toLowerCase();
  const matchedTodos = todos.filter(
    (todo) =>
      todo.task.toLowerCase().includes(searchTerm) ||
      todo.status.toLowerCase().includes(searchTerm)
  );

  res.send(matchedTodos);
});

app.get("/todos/:id", (req, res) => {
  const todo = todos.find((c) => c.id === parseInt(req.params.id));
  if (!todo)
    return res.status(404).send("The task with the given ID was not found.");
  else res.send(todo);
});

app.post("/todos", (req, res) => {
  const todo = {
    id: todos.length + 1,
    task: req.body.task,
    status: req.body.status,
  };
  todos.push(todo);
  res.send(todos);
});

app.put("/todos/:id", (req, res) => {
  const todo = todos.find((c) => c.id === parseInt(req.params.id));
  if (!todo)
    return res.status(404).send("The task with the given ID was not found.");
  else {
    todo.task = req.body.task;
    todo.status = req.body.status;
  }
  res.send(todo);
});

app.delete("/todos/:id", (req, res) => {
  const todo = todos.find((c) => c.id === parseInt(req.params.id));
  if (!todo)
    return res.status(404).send("The task with the given ID was not found.");
  else {
    const index = todos.indexOf(todo);
    todos.splice(index, 1);
    res.send(todo);
  }
});
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
