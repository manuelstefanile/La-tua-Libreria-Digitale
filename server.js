
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configurazione Database - Supporta sia Cloud SQL che connessioni standard
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Se è presente INSTANCE_CONNECTION_NAME, usiamo il socket di Cloud SQL
if (process.env.INSTANCE_CONNECTION_NAME) {
  dbConfig.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
  delete dbConfig.host;
}

const pool = mysql.createPool(dbConfig);

// Inizializzazione Database: Creazione tabelle se non esistono
const initDb = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('📦 Inizializzazione tabelle database...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS books (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50),
        userId VARCHAR(50),
        coverUrl TEXT,
        createdAt BIGINT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('✅ Tabelle verificate/create correttamente.');
  } catch (err) {
    console.error('❌ Errore critico inizializzazione DB:', err.message);
  }
};

initDb();

// Middleware di logging
app.use('/api', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// --- API: HEALTH CHECK ---
app.get('/api/health', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// --- API: AUTH ---
app.post('/api/auth/register', async (req, res) => {
  const { id, username, email, password } = req.body;
  try {
    await pool.query(
      'INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)',
      [id, username, email, password]
    );
    res.status(201).json({ id, username, email });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: 'Email già esistente o dati non validi.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(401).json({ error: 'Credenziali non valide.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API: BOOKS CRUD ---
app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  const b = req.body;
  try {
    await pool.query(
      'INSERT INTO books (id, title, author, description, status, userId, coverUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [b.id, b.title, b.author, b.description, b.status, b.userId, b.coverUrl, b.createdAt]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author, description, status, coverUrl } = req.body;
  try {
    await pool.query(
      'UPDATE books SET title = ?, author = ?, description = ?, status = ?, coverUrl = ? WHERE id = ?',
      [title, author, description, status, coverUrl, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM books WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SERVING FRONTEND ---
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('<h1>Server BiblioTech Online</h1><p>API pronte e DB inizializzato.</p>');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('=========================================');
  console.log(`🚀 BIBLIOTECH SERVER OPERATIVO`);
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log('=========================================');
});
