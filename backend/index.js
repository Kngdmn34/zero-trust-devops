require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Protected route
app.get('/todos', ClerkExpressRequireAuth(), async (req, res) => {
  const todos = await prisma.todo.findMany();
  res.json(todos);
});

app.post('/todos', ClerkExpressRequireAuth(), async (req, res) => {
  const { title } = req.body;
  const todo = await prisma.todo.create({ data: { title } });
  res.json(todo);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
