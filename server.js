
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

// Configurazione Database
const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware di logging
app.use('/api', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// --- ENDPOINT RICHIESTO: VERIFICA CONNESSIONE ---

app.get('/api/health', async (req, res) => {
  console.log('-> Controllo stato sistema e database...');
  let dbStatus = 'error';
  let dbError = null;

  try {
    // Eseguiamo una query ultra-leggera per testare la connessione
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    dbStatus = 'ok';
    console.log('✅ Database connesso correttamente.');
  } catch (err) {
    dbError = err.message;
    console.error('❌ Errore connessione Database:', err.message);
  }

  res.json({ 
    status: 'ok', 
    database: dbStatus,
    error: dbError,
    timestamp: new Date().toISOString()
  });
});

// --- ALTRI ENDPOINT API (Esempio CRUD) ---

app.post('/api/auth/login', (req, res) => {
  res.json({ id: 'user-123', username: 'Ospite', email: req.body.email });
});

app.get('/api/books', async (req, res) => {
  try {
    // Se la tabella non esiste, questo fallirà - gestito con try/catch
    const [rows] = await pool.query('SELECT * FROM books ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    // Se il DB non è ancora pronto o la tabella manca, restituiamo un array vuoto
    res.json([]);
  }
});

app.post('/api/books', async (req, res) => {
  const b = req.body;
  try {
    await pool.query(
      'INSERT INTO books (id, title, author, description, status, userId, coverUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [b.id, b.title, b.author, b.description, b.status, b.userId, b.coverUrl, Date.now()]
    );
    res.status(201).json({ success: true });
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
      res.status(200).send('<h1>Server BiblioTech Attivo</h1><p>Verifica database su /api/health</p>');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('=========================================');
  console.log(`🚀 BIBLIOTECH SERVER ONLINE`);
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log('=========================================');
});
