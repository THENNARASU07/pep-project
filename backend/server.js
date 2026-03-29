const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const { pool } = require('./db.js');
const studentsRoutes = require('./routes/students.js');
const testsRoutes = require('./routes/tests.js');
const resultsRoutes = require('./routes/results.js');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mount route modules
app.use('/api/students', studentsRoutes(pool));
app.use('/api/tests', testsRoutes(pool));
app.use('/api/results', resultsRoutes(pool));

// Seed data route -- creates all tables and default admin/student users
app.get('/api/seed', async (req, res) => {
    try {
        // Users table (expanded)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'student',
                name VARCHAR(255),
                roll_no VARCHAR(50),
                reg_no VARCHAR(50),
                department VARCHAR(100),
                class_section VARCHAR(50),
                profile_image TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Tests table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tests (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                test_type VARCHAR(20) NOT NULL,
                duration_minutes INTEGER DEFAULT 60,
                created_by INTEGER REFERENCES users(id),
                is_published BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Quiz questions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS quiz_questions (
                id SERIAL PRIMARY KEY,
                test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
                question_number INTEGER NOT NULL,
                question_text TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_option CHAR(1) NOT NULL,
                marks INTEGER DEFAULT 1
            );
        `);

        // Code problems table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS code_problems (
                id SERIAL PRIMARY KEY,
                test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
                problem_number INTEGER NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                input_format TEXT,
                output_format TEXT,
                constraints_text TEXT,
                sample_input TEXT,
                sample_output TEXT,
                marks INTEGER DEFAULT 10
            );
        `);

        // Code test cases table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS code_test_cases (
                id SERIAL PRIMARY KEY,
                problem_id INTEGER REFERENCES code_problems(id) ON DELETE CASCADE,
                input TEXT NOT NULL,
                expected_output TEXT NOT NULL,
                is_hidden BOOLEAN DEFAULT false
            );
        `);

        // Test results table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS test_results (
                id SERIAL PRIMARY KEY,
                test_id INTEGER REFERENCES tests(id),
                student_id INTEGER REFERENCES users(id),
                score DECIMAL(5,2),
                total_marks INTEGER,
                submitted_at TIMESTAMP DEFAULT NOW(),
                status VARCHAR(20) DEFAULT 'completed'
            );
        `);

        // Seed default admin and student users
        await pool.query(`
            INSERT INTO users (email, password, role, name)
            VALUES
                ('admin@gmail.com', '123', 'admin', 'Admin'),
                ('student@gmail.com', '123', 'student', 'Demo Student')
            ON CONFLICT (email) DO NOTHING;
        `);

        res.status(201).json({ message: 'Database seeded successfully. All tables created.' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding database', error: error.message });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && user.password === password) {
            res.json({
                _id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                profile_image: user.profile_image,
                message: 'Login successful'
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
