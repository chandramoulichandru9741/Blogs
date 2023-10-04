const express = require('express');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Define your routes
const blogRoutes = require('./routes/blog');
app.use('/api', blogRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
