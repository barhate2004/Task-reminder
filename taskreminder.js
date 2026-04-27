const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'task_reminder',
    password: 'root',
    port: 5432,
});


//  GET ALL TASKS
app.get('/tasks', async (req, res) => {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    res.json(result.rows);
});


// GET ONE TASK
app.get('/tasks/:id', async (req, res) => {
    const result = await pool.query('SELECT * FROM tasks WHERE id=$1', [req.params.id]);
    res.json(result.rows[0]);
});


// ADD TASK
app.post('/tasks', async (req, res) => {
    const { title, description, reminder_time } = req.body;

    const result = await pool.query(
        'INSERT INTO tasks(title, description, reminder_time, is_completed) VALUES($1,$2,$3,$4) RETURNING *',
        [title, description, reminder_time, false]
    );

    res.json(result.rows[0]);
});


// UPDATE TASK 
app.put('/tasks/:id', async (req, res) => {
    const { title, description, reminder_time, is_completed } = req.body;

    const result = await pool.query(
        'UPDATE tasks SET title=$1, description=$2, reminder_time=$3, is_completed=$4 WHERE id=$5 RETURNING *',
        [
            title,
            description,
            reminder_time,
            is_completed ?? false,   // 🔥 important fix
            req.params.id
        ]
    );

    res.json(result.rows[0]);
});


// DELETE TASK
app.delete('/tasks/:id', async (req, res) => {
    await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    res.json({ message: "Deleted" });
});


app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});