require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');

const db = require('./config/db');

const PORT = process.env.PORT || 5000;
const app = express();

/* ───── Middleware ───── */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/* ───── Routes ───── */
app.use('/api/auth', authRoutes);
// app.use('/api/report', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
// app.use('/api', categoryRoutes);

/* ───── Health Checks ───── */
app.get('/', (req, res) => {
  res.send('Backend is live');
});

app.get('/db-test', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'DB OK' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ───── Boot ───── */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});


