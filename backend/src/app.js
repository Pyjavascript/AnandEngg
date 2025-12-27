require('dotenv').config();
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 5000;


const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
  res.send('Backend is live');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
