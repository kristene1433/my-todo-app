require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const axios = require('axios');
const Task = require('./models/Task');
const authRoutes = require('./routes/auth');  // Import authentication routes
const authMiddleware = require('./middleware/authMiddleware'); // Import the authentication middleware

// Server configuration
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Authentication routes
app.use('/api/auth', authRoutes); // Use auth routes

// Protected route example
app.get('/api/protected', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'This is a protected route' });
});

// Task-related API routes
app.post('/api/tasks', authMiddleware, async (req, res) => {  // Protect task routes with authMiddleware
  try {
    const { date, description, priority, category } = req.body;
    const task = new Task({
      date: new Date(date),
      description,
      priority,
      category,
      isCompleted: false,  // Initialize with isCompleted status as false
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/tasks', authMiddleware, async (req, res) => {  // Protect task routes with authMiddleware
  try {
    const tasks = await Task.find({});
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:taskId', authMiddleware, async (req, res) => {  // Protect task routes with authMiddleware
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks/:taskId', authMiddleware, async (req, res) => {  // Protect task routes with authMiddleware
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:taskId', authMiddleware, async (req, res) => {  // Protect task routes with authMiddleware
  try {
    const { date, description, priority, category, isCompleted } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields
    task.date = new Date(date) || task.date;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.category = category || task.category;
    task.isCompleted = isCompleted !== undefined ? isCompleted : task.isCompleted;

    await task.save();
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Chatbot API route
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 150,
      temperature: 0.9,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const botReply = response.data.choices[0].message.content.trim();
    res.json({ reply: botReply });
  } catch (error) {
    console.error('Error in chatbot API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error communicating with the chatbot' });
  }
});

// Serve the React app's index.html file for the root route (Only for production use)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.get('/api/check-connection', (req, res) => {
  try {
    console.log('GET /api/check-connection called'); // Log when the route is hit
    res.status(200).json({ message: 'Connection successful!' });
  } catch (err) {
    console.error('Error in GET /api/check-connection:', err); // Log the exact error
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.post('/api/check-connection', (req, res) => {
  const data = req.body;
  res.status(200).json({ message: 'POST request successful!', data });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Connect to MongoDB and start the server
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => app.listen(port, () => console.log(`Server running on port ${port}`)))
  .catch(err => console.error('Database connection error:', err));
