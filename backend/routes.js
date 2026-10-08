const express = require('express');
const router = express.Router();
const db = require('./db');

// ============================================
// 1. CREATE - POST /api/opportunities
// ============================================
router.post('/', async (req, res) => {
  try {
    const { title, description, area, skills, positions, deadline, status } = req.body;

    // Validation
    if (!title || !description || !area) {
      return res.status(400).json({
        error: 'title, description, and area are required fields'
      });
    }

    const sql = `
      INSERT INTO opportunities 
      (title, description, area, skills, positions, deadline, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      title,
      description,
      area,
      skills || null,
      positions || 1,
      deadline || null,
      status || 'Open'
    ]);

    // Fetch the newly created row
    const [rows] = await db.execute(
      'SELECT * FROM opportunities WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ============================================
// 2. READ ALL - GET /api/opportunities
// ============================================
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM opportunities ORDER BY created_at DESC'
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('GET all error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ============================================
// 3. READ ONE - GET /api/opportunities/:id
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM opportunities WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('GET one error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ============================================
// 4. UPDATE - PUT /api/opportunities/:id
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { title, description, area, skills, positions, deadline, status } = req.body;

    // Check if record exists first
    const [existing] = await db.execute(
      'SELECT * FROM opportunities WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const current = existing[0];

    // Update only fields that were provided
    const sql = `
      UPDATE opportunities SET
        title = ?,
        description = ?,
        area = ?,
        skills = ?,
        positions = ?,
        deadline = ?,
        status = ?
      WHERE id = ?
    `;

    await db.execute(sql, [
      title !== undefined ? title : current.title,
      description !== undefined ? description : current.description,
      area !== undefined ? area : current.area,
      skills !== undefined ? skills : current.skills,
      positions !== undefined ? positions : current.positions,
      deadline !== undefined ? deadline : current.deadline,
      status !== undefined ? status : current.status,
      req.params.id
    ]);

    // Return updated row
    const [updated] = await db.execute(
      'SELECT * FROM opportunities WHERE id = ?',
      [req.params.id]
    );

    res.status(200).json(updated[0]);
  } catch (err) {
    console.error('PUT error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ============================================
// 5. DELETE - DELETE /api/opportunities/:id
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM opportunities WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.status(200).json({ message: 'Opportunity deleted successfully' });
  } catch (err) {
    console.error('DELETE error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
