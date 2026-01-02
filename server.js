
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database in memoria (si azzera ad ogni riavvio del container)
let books = [];

// Middleware di logging globale per le API
app.use('/api', (req, res, next) => {
  console.log(`[API CALL] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// --- ENDPOINT API ---

app.get('/api/health', (req, res) => {
  console.log('-> Rispondo a Health Check: Server Vivo');
  res.json({ status: 'ok', message: 'Benvenuto nelle API di BiblioTech!' });
});

app.post('/api/auth/login', (req, res) => {
  console.log(`-> Login ricevuto per: ${req.body.email}`);
  res.json({ id: 'user-123', username: 'Ospite', email: req.body.email });
});

app.post('/api/auth/register', (req, res) => {
  console.log(`-> Registrazione per: ${req.body.email}`);
  res.json({ id: 'user-123', username: 'Ospite', email: req.body.email });
});

app.get('/api/books', (req, res) => {
  console.log(`-> Restituisco ${books.length} libri`);
  res.json(books);
});

app.post('/api/books', (req, res) => {
  console.log(`-> Aggiunta nuovo libro: ${req.body.title}`);
  const newBook = { ...req.body, createdAt: Date.now() };
  books.push(newBook);
  res.status(201).json({ success: true, book: newBook });
});

app.delete('/api/books/:id', (req, res) => {
  console.log(`-> Eliminazione libro ID: ${req.params.id}`);
  books = books.filter(b => b.id !== req.params.id);
  res.json({ success: true });
});

// --- SERVING FRONTEND (Dalla cartella /dist generata da Vite) ---

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Qualsiasi altra rotta serve l'index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('<h1>Server BiblioTech Attivo</h1><p>Le API sono pronte su /api. Esegui "npm run build" per caricare il frontend qui.</p>');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('=========================================');
  console.log(`🚀 BIBLIOTECH SERVER ONLINE`);
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/health`);
  console.log('=========================================');
});
