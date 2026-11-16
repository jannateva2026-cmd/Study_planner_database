
const db = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.*, f.name AS faculty_name, p.level AS priority, p.priority_score
       FROM subjects s
       LEFT JOIN faculty f   ON s.faculty_id = f.faculty_id
       LEFT JOIN priorities p ON s.id = p.subject_id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try {
    const { name, faculty_id, credit_hours = 3 } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const [result] = await db.execute(
      'INSERT INTO subjects (user_id, faculty_id, name, credit_hours) VALUES (?,?,?,?)',
      [req.user.id, faculty_id || null, name, credit_hours]
    );
    res.status(201).json({ success: true, insertId: result.insertId });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await db.execute(
      'DELETE FROM subjects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};