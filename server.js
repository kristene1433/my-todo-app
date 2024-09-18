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
const port = process.env.PORT || 5000; // Use the correct port in production environment
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Authentication routes
app.use('/api/auth', authRoutes); // Use auth routes

// Task-related API routes
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1, 10 items per page
    const tasks = await Task.find({})
      .select('description priority isCompleted') // Only select necessary fields
      .lean() // Return plain JavaScript objects instead of Mongoose documents
      .skip((page - 1) * limit) // Skip items for pagination
      .limit(parseInt(limit)); // Limit the number of items per page
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { date, description, priority, category } = req.body;
    const task = new Task({
      date: new Date(date),
      description,
      priority,
      category,
      isCompleted: false,
    });
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Other Task routes (GET, PUT, DELETE) remain unchanged...

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

// Serve static files in production (React app)
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app's build folder
  app.use(express.static(path.join(__dirname, 'client/build')));

  // The "catchall" handler: for any request that doesn't match API routes,
  // send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Health check route
app.get('/api/check-connection', (req, res) => {
  try {
    console.log('GET /api/check-connection called');
    res.status(200).json({ message: 'Connection successful!' });
  } catch (err) {
    console.error('Error in GET /api/check-connection:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Connect to MongoDB and start the server
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Database connected successfully');
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.error('Database connection error:', err));

  