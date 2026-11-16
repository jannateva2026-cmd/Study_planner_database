
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

const JWT_SECRET  = process.env.JWT_SECRET  || 'study_planner_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, student_id, email, password, role = 'student' } = req.body;
    if (!name || !password || (!student_id && !email)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, student_id, email, password, role) VALUES (?,?,?,?,?)',
      [name, student_id || null, email || null, hash, role]
    );

    // Init points & streak rows
    await db.execute('INSERT INTO user_points (user_id) VALUES (?)', [result.insertId]);
    await db.execute('INSERT INTO daily_streaks (user_id) VALUES (?)', [result.insertId]);
    await db.execute('INSERT INTO user_settings (user_id) VALUES (?)', [result.insertId]);

    const token = jwt.sign({ id: result.insertId, role, student_id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(201).json({ success: true, token, userId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Student ID or email already exists' });
    }
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { student_id, email, password } = req.body;

    const field = student_id ? 'student_id' : 'email';
    const value = student_id || email;
    if (!value || !password) {
      return res.status(400).json({ success: false, message: 'Credentials required' });
    }

    const [rows] = await db.execute(`SELECT * FROM users WHERE ${field} = ?`, [value]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, student_id: user.student_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.json({ success: true, token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, student_id, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};