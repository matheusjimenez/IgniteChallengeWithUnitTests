const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const filteredUser = users.find((user) => user.username === username);

  if(!filteredUser)
    return response.status(404).json({ error: "Mensagem do erro" });

  request.user = filteredUser;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists)
    return response.status(400).json({ error: "Mensagem do erro" });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { deadline, title } = request.body;

  const newTodo = {
    id: uuidv4(),
    created_at: new Date(),
    title,
    deadline: new Date(deadline),
    done: false
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { deadline, title } = request.body;

  const index = user.todos.findIndex((todo) => todo.id === id);
  const filteredTodo = user.todos.find((todo) => todo.id === id);

  if(!filteredTodo)
    return response.status(404).json({ error: "Invalid todo ID" });
  
  filteredTodo.deadline = deadline;
  filteredTodo.title = title;

  user[index] = filteredTodo;

  return response.status(200).json(filteredTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((todo)=> todo.id === id);

  if(index === -1)
    return response.status(404).json({ error : "Invalid todo ID" });

  user.todos[index].done = true;

  return response.status(200).json(user.todos[index]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const selectedTodo = user.todos.findIndex((todo) => todo.id === id);

  if(selectedTodo === -1)
    return response.status(404).json({ error: "invalid Todo ID" });
  
  user.todos.splice(selectedTodo, 1);

  response.status(204).json(user);
});

module.exports = app;