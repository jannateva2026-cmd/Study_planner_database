
require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');

const authRoutes      = require('./routes/auth');
const subjectRoutes   = require('./routes/subjects');
const eventRoutes     = require('./routes/events');
const taskRoutes      = require('./routes/tasks');
const scheduleRoutes  = require('./routes/schedules');
const analyticsRoutes = require('./routes/analytics');
const sessionRoutes   = require('./routes/sessions');
const groupRoutes     = require('./routes/groups');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth',      authRoutes);
app.use('/api/subjects',  subjectRoutes);
app.use('/api/events',    eventRoutes);
app.use('/api/tasks',     taskRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sessions',  sessionRoutes);
app.use('/api/groups',    groupRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StudyPlanner API running on port ${PORT}`));