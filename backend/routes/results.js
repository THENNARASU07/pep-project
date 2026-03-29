const express = require('express');
const router = express.Router();

module.exports = (pool) => {

    // GET /api/results - Get all results with optional test filter
    router.get('/', async (req, res) => {
        try {
            const { test_id } = req.query;
            let query = `
                SELECT tr.*, u.name as student_name, u.email as student_email, u.reg_no,
                       t.title as test_title, t.test_type
                FROM test_results tr
                JOIN users u ON tr.student_id = u.id
                JOIN tests t ON tr.test_id = t.id
            `;
            const params = [];

            if (test_id) {
                query += ' WHERE tr.test_id = $1';
                params.push(test_id);
            }

            query += ' ORDER BY tr.submitted_at DESC';

            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching results', error: error.message });
        }
    });

    // GET /api/results/count - Result stats for dashboard
    router.get('/count', async (req, res) => {
        try {
            const total = await pool.query('SELECT COUNT(*) as total FROM test_results');
            const pending = await pool.query("SELECT COUNT(*) as total FROM test_results WHERE status = 'pending'");
            const completed = await pool.query("SELECT COUNT(*) as total FROM test_results WHERE status = 'completed'");

            res.json({
                total: parseInt(total.rows[0].total),
                pending: parseInt(pending.rows[0].total),
                completed: parseInt(completed.rows[0].total)
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching result stats', error: error.message });
        }
    });

    // GET /api/results/csv - Download results as CSV
    router.get('/csv', async (req, res) => {
        try {
            const { test_id } = req.query;
            let query = `
                SELECT u.name as "Student Name", u.email as "Email", u.reg_no as "Reg No",
                       t.title as "Test Name", tr.score as "Score", tr.total_marks as "Total Marks",
                       tr.submitted_at as "Submitted At"
                FROM test_results tr
                JOIN users u ON tr.student_id = u.id
                JOIN tests t ON tr.test_id = t.id
            `;
            const params = [];

            if (test_id) {
                query += ' WHERE tr.test_id = $1';
                params.push(test_id);
            }

            query += ' ORDER BY u.name ASC';

            const result = await pool.query(query, params);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No results found' });
            }

            // Build CSV
            const headers = Object.keys(result.rows[0]);
            let csv = headers.join(',') + '\n';
            for (const row of result.rows) {
                const values = headers.map(h => {
                    const val = row[h] !== null && row[h] !== undefined ? String(row[h]) : '';
                    return `"${val.replace(/"/g, '""')}"`;
                });
                csv += values.join(',') + '\n';
            }

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=test_results.csv');
            res.send(csv);
        } catch (error) {
            res.status(500).json({ message: 'Error generating CSV', error: error.message });
        }
    });

    // POST /api/results - Submit a test result
    router.post('/', async (req, res) => {
        try {
            const { test_id, student_id, score, total_marks, status } = req.body;
            let query = `
                INSERT INTO test_results (test_id, student_id, score, total_marks, status)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const result = await pool.query(query, [test_id, student_id, score, total_marks, status || 'completed']);
            
            res.status(201).json({ message: 'Test result submitted successfully', result: result.rows[0] });
        } catch (error) {
            res.status(500).json({ message: 'Error submitting result', error: error.message });
        }
    });

    return router;
};
