const express = require('express');
const router = express.Router();
const multer = require('multer');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

module.exports = (pool) => {

    // GET /api/students - List all students with optional filters
    router.get('/', async (req, res) => {
        try {
            const { search, department, class_section } = req.query;
            let query = "SELECT id, name, email, roll_no, reg_no, department, class_section, created_at FROM users WHERE role = 'student'";
            const params = [];
            let paramIndex = 1;

            if (search) {
                query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR roll_no ILIKE $${paramIndex})`;
                params.push(`%${search}%`);
                paramIndex++;
            }
            if (department) {
                query += ` AND department = $${paramIndex}`;
                params.push(department);
                paramIndex++;
            }
            if (class_section) {
                query += ` AND class_section = $${paramIndex}`;
                params.push(class_section);
                paramIndex++;
            }

            query += ' ORDER BY name ASC';
            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching students', error: error.message });
        }
    });

    // GET /api/students/count - Dashboard count
    router.get('/count', async (req, res) => {
        try {
            const result = await pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'student'");
            res.json({ total: parseInt(result.rows[0].total) });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching count', error: error.message });
        }
    });

    // GET /api/students/template - Download CSV template
    router.get('/template', (req, res) => {
        const csvContent = 'S.No,Class,Roll No,Reg No,Name,Email\n1,A,24CS360,3123241040,SAMPLE STUDENT,24CS360@gmail.com\n';
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=student_template.csv');
        res.send(csvContent);
    });

    // POST /api/students - Create single student
    router.post('/', async (req, res) => {
        try {
            const { name, email, reg_no, roll_no, department, class_section } = req.body;

            // Use reg_no as the default password
            const password = reg_no;

            const result = await pool.query(
                `INSERT INTO users (name, email, password, role, roll_no, reg_no, department, class_section)
                 VALUES ($1, $2, $3, 'student', $4, $5, $6, $7)
                 RETURNING id, name, email, roll_no, reg_no, department, class_section`,
                [name, email, password, roll_no, reg_no, department, class_section]
            );

            res.status(201).json({ message: 'Student created successfully', student: result.rows[0] });
        } catch (error) {
            if (error.code === '23505') {
                res.status(409).json({ message: 'A student with this email already exists' });
            } else {
                res.status(500).json({ message: 'Error creating student', error: error.message });
            }
        }
    });

    // POST /api/students/bulk - Bulk upload from CSV
    const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

    router.post('/bulk', upload.single('file'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const department = req.body.department || 'CSE';
            const csvFile = fs.readFileSync(req.file.path, 'utf8');
            const parsed = Papa.parse(csvFile, { header: true, skipEmptyLines: true });

            if (parsed.errors.length > 0) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ message: 'CSV parsing error', errors: parsed.errors });
            }

            let insertedCount = 0;
            let skippedCount = 0;
            const errors = [];

            for (const row of parsed.data) {
                const name = row['Name'] || row['name'] || '';
                const email = row['Email'] || row['email'] || '';
                const rollNo = row['Roll No'] || row['roll_no'] || row['RollNo'] || '';
                const regNo = row['Reg No'] || row['reg_no'] || row['RegNo'] || '';
                const classSection = row['Class'] || row['class'] || row['class_section'] || '';

                if (!name || !email) {
                    skippedCount++;
                    continue;
                }

                try {
                    await pool.query(
                        `INSERT INTO users (name, email, password, role, roll_no, reg_no, department, class_section)
                         VALUES ($1, $2, $3, 'student', $4, $5, $6, $7)
                         ON CONFLICT (email) DO NOTHING`,
                        [name.trim(), email.trim(), regNo.trim(), rollNo.trim(), regNo.trim(), department, classSection.trim()]
                    );
                    insertedCount++;
                } catch (err) {
                    skippedCount++;
                    errors.push({ email, error: err.message });
                }
            }

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);

            res.status(201).json({
                message: `Bulk upload complete. ${insertedCount} students created, ${skippedCount} skipped.`,
                inserted: insertedCount,
                skipped: skippedCount,
                errors
            });
        } catch (error) {
            res.status(500).json({ message: 'Error processing bulk upload', error: error.message });
        }
    });

    // PUT /api/students/:id/profile-pic - Update profile image (base64)
    router.put('/:id/profile-pic', async (req, res) => {
        try {
            const { id } = req.params;
            const { profile_image } = req.body;
            
            const result = await pool.query(
                "UPDATE users SET profile_image = $1 WHERE id = $2 AND role = 'student' RETURNING id, profile_image",
                [profile_image, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Student not found' });
            }
            res.json({ message: 'Profile picture updated successfully', user: result.rows[0] });
        } catch (error) {
            res.status(500).json({ message: 'Error updating profile picture', error: error.message });
        }
    });

    // DELETE /api/students/:id - Delete student
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            await pool.query("DELETE FROM users WHERE id = $1 AND role = 'student'", [id]);
            res.json({ message: 'Student deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting student', error: error.message });
        }
    });

    return router;
};
