// ============================================================
// backend/controllers/eventController.js
// ============================================================

const db = require('../config/db');

// GET /api/events
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT e.*, s.name AS subject_name, t.name AS trimester_name
       FROM events e
       LEFT JOIN subjects s    ON e.subject_id   = s.id
       LEFT JOIN trimesters t  ON e.trimester_id = t.id
       WHERE e.created_by = ?
       ORDER BY e.event_date ASC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// POST /api/events
exports.create = async (req, res, next) => {
  try {
    const { title, type, event_date, subject_id, trimester_id } = req.body;
    if (!title || !type || !event_date) {
      return res.status(400).json({ success: false, message: 'title, type and event_date are required' });
    }
    const [result] = await db.execute(
      'INSERT INTO events (title, type, event_date, subject_id, trimester_id, created_by) VALUES (?,?,?,?,?,?)',
      [title, type, event_date, subject_id || null, trimester_id || null, req.user.id]
    );
    res.status(201).json({ success: true, insertId: result.insertId });
  } catch (err) { next(err); }
};

// DELETE /api/events/:id
exports.remove = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM events WHERE id = ? AND created_by = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};