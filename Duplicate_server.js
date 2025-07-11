const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is up and running!' });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

