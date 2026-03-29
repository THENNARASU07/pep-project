const express = require('express');
const router = express.Router();

module.exports = (pool) => {

    // GET /api/tests - List all tests
    router.get('/', async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT t.*, u.name as creator_name,
                    (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.test_id = t.id) as question_count,
                    (SELECT COUNT(*) FROM code_problems cp WHERE cp.test_id = t.id) as problem_count
                 FROM tests t
                 LEFT JOIN users u ON t.created_by = u.id
                 ORDER BY t.created_at DESC`
            );
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching tests', error: error.message });
        }
    });

    // GET /api/tests/count - Dashboard count
    router.get('/count', async (req, res) => {
        try {
            const result = await pool.query('SELECT COUNT(*) as total FROM tests');
            res.json({ total: parseInt(result.rows[0].total) });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching count', error: error.message });
        }
    });

    // GET /api/tests/:id - Get test with all questions/problems
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;

            const testResult = await pool.query('SELECT * FROM tests WHERE id = $1', [id]);
            if (testResult.rows.length === 0) {
                return res.status(404).json({ message: 'Test not found' });
            }

            const test = testResult.rows[0];

            if (test.test_type === 'quiz') {
                const questions = await pool.query(
                    'SELECT * FROM quiz_questions WHERE test_id = $1 ORDER BY question_number',
                    [id]
                );
                test.questions = questions.rows;
            } else {
                const problems = await pool.query(
                    'SELECT * FROM code_problems WHERE test_id = $1 ORDER BY problem_number',
                    [id]
                );
                for (const problem of problems.rows) {
                    const testCases = await pool.query(
                        'SELECT * FROM code_test_cases WHERE problem_id = $1 ORDER BY id',
                        [problem.id]
                    );
                    problem.test_cases = testCases.rows;
                }
                test.problems = problems.rows;
            }

            res.json(test);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching test', error: error.message });
        }
    });

    // POST /api/tests/quiz - Create a quiz test
    router.post('/quiz', async (req, res) => {
        try {
            const { title, description, duration_minutes, questions, created_by } = req.body;

            // Insert the test
            const testResult = await pool.query(
                `INSERT INTO tests (title, description, test_type, duration_minutes, created_by, is_published)
                 VALUES ($1, $2, 'quiz', $3, $4, true) RETURNING *`,
                [title, description, duration_minutes || 60, created_by || 1]
            );
            const testId = testResult.rows[0].id;

            // Insert questions
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                await pool.query(
                    `INSERT INTO quiz_questions (test_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_option, marks)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [testId, i + 1, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.marks || 1]
                );
            }

            res.status(201).json({ message: 'Quiz test created successfully', test: testResult.rows[0] });
        } catch (error) {
            res.status(500).json({ message: 'Error creating quiz', error: error.message });
        }
    });

    // POST /api/tests/code - Create a code test
    router.post('/code', async (req, res) => {
        try {
            const { title, description, duration_minutes, problems, created_by } = req.body;

            const testResult = await pool.query(
                `INSERT INTO tests (title, description, test_type, duration_minutes, created_by, is_published)
                 VALUES ($1, $2, 'code', $3, $4, true) RETURNING *`,
                [title, description, duration_minutes || 90, created_by || 1]
            );
            const testId = testResult.rows[0].id;

            for (let i = 0; i < problems.length; i++) {
                const p = problems[i];
                const problemResult = await pool.query(
                    `INSERT INTO code_problems (test_id, problem_number, title, description, input_format, output_format, constraints_text, sample_input, sample_output, marks)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
                    [testId, i + 1, p.title, p.description, p.input_format, p.output_format, p.constraints_text, p.sample_input, p.sample_output, p.marks || 10]
                );

                const problemId = problemResult.rows[0].id;

                // Insert test cases
                if (p.test_cases && p.test_cases.length > 0) {
                    for (const tc of p.test_cases) {
                        await pool.query(
                            `INSERT INTO code_test_cases (problem_id, input, expected_output, is_hidden)
                             VALUES ($1, $2, $3, $4)`,
                            [problemId, tc.input, tc.expected_output, tc.is_hidden || false]
                        );
                    }
                }
            }

            res.status(201).json({ message: 'Code test created successfully', test: testResult.rows[0] });
        } catch (error) {
            res.status(500).json({ message: 'Error creating code test', error: error.message });
        }
    });

    // PUT /api/tests/:id/publish - Toggle publish
    router.put('/:id/publish', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'UPDATE tests SET is_published = NOT is_published WHERE id = $1 RETURNING *',
                [id]
            );
            res.json({ message: 'Test publish status updated', test: result.rows[0] });
        } catch (error) {
            res.status(500).json({ message: 'Error updating test', error: error.message });
        }
    });

    // DELETE /api/tests/:id - Delete test
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM tests WHERE id = $1', [id]);
            res.json({ message: 'Test deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting test', error: error.message });
        }
    });

    return router;
};
