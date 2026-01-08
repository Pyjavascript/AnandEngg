require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs')
const cors = require('cors');
const PORT = process.env.PORT || 5000;


const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes')
const db = require('./config/db');

const app = express();
const fn = async() => {
  // console.log(await bcrypt.hash('test1234', 10));
}

// app.use(cors({allowedHeaders: ['Content-Type', 'Authorization']}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/report', reportRoutes);

app.get('/', (req, res) => {
  res.send('Backend is live');
  fn();
  
});
app.get('/db-test', (req, res) => {
  db.query('SELECT 1', (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ status: 'DB OK' });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

