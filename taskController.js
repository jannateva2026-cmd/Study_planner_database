// ============================================================
// backend/controllers/taskController.js
// ============================================================

const db = require('../config/db');

// GET /api/tasks
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT t.*, s.name AS subject_name
       FROM tasks t
       LEFT JOIN subjects s ON t.subject_id = s.id
       WHERE t.user_id = ?
       ORDER BY t.due_date ASC, t.priority_level DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// POST /api/tasks
exports.create = async (req, res, next) => {
  try {
    const { title, description, due_date, priority_level = 'MEDIUM', subject_id } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    const [result] = await db.execute(
      'INSERT INTO tasks (user_id, subject_id, title, description, due_date, priority_level) VALUES (?,?,?,?,?,?)',
      [req.user.id, subject_id || null, title, description || null, due_date || null, priority_level]
    );
    res.status(201).json({ success: true, insertId: result.insertId });
  } catch (err) { next(err); }
};

// PATCH /api/tasks/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    await db.execute(
      'UPDATE tasks SET status = ? WHERE task_id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );
    // Award points if completed
    if (status === 'COMPLETED') {
      await db.execute(
        'UPDATE user_points SET total_points = total_points + 10 WHERE user_id = ?',
        [req.user.id]
      );
    }
    res.json({ success: true });
  } catch (err) { next(err); }
};

// DELETE /api/tasks/:id
exports.remove = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM tasks WHERE task_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};