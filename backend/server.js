require('dotenv').config(); // <=== السطر المفقود اللي بيشغل الـ env بالكامل!
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://coptic-encyclopedia-production.up.railway.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false } 
  // حركة صايعة: لو شغال لوكال يقفل الـ SSL، لو أونلاين (Railway) يشغله تلقائياً
});

async function initDatabase() {
  try {
    console.log('⏳ جاري التحقق من هيكلة جداول قاعدة البيانات...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seasons (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hymns (
        id SERIAL PRIMARY KEY,
        season_slug VARCHAR(100) REFERENCES seasons(slug) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        liturgy_type VARCHAR(100),
        ritual_notes TEXT,
        performance_style TEXT,
        text_coptic TEXT,
        text_arabic_coptic TEXT,
        text_arabic TEXT,
        audio_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`ALTER TABLE hymns ADD COLUMN IF NOT EXISTS performance_style TEXT;`);
    
    console.log('✅ قاعدة البيانات مستقرة وجاهزة!');
  } catch (err) {
    console.error('❌ خطأ أثناء تهيئة قاعدة البيانات:');
    console.error(err); // بيطبع الخطأ كامل بالتفصيل في السطور اللي تحتها
  }
}
initDatabase();

// ==================== الـ API Endpoints ====================

app.post('/api/seasons', async (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ error: "برجاء كتابة اسم الموسم والرمز" });
  try {
    const result = await pool.query(`INSERT INTO seasons (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING RETURNING *`, [name, slug]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/seasons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM seasons ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/hymns', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hymns ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/hymns/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM hymns WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "اللحن غير موجود" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/hymns', async (req, res) => {
  const { season_slug, title, liturgy_type, ritual_notes, performance_style, text_coptic, text_arabic_coptic, text_arabic, audio_url } = req.body;
  try {
    const queryText = `
      INSERT INTO hymns (season_slug, title, liturgy_type, ritual_notes, performance_style, text_coptic, text_arabic_coptic, text_arabic, audio_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `;
    const result = await pool.query(queryText, [season_slug, title, liturgy_type, ritual_notes, performance_style, text_coptic, text_arabic_coptic, text_arabic, audio_url]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/hymns/:id', async (req, res) => {
  const { id } = req.params;
  const { season_slug, title, liturgy_type, ritual_notes, performance_style, text_coptic, text_arabic_coptic, text_arabic, audio_url } = req.body;
  try {
    const queryText = `
      UPDATE hymns 
      SET season_slug=$1, title=$2, liturgy_type=$3, ritual_notes=$4, performance_style=$5, text_coptic=$6, text_arabic_coptic=$7, text_arabic=$8, audio_url=$9
      WHERE id=$10 RETURNING *
    `;
    const result = await pool.query(queryText, [season_slug, title, liturgy_type, ritual_notes, performance_style, text_coptic, text_arabic_coptic, text_arabic, audio_url, id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/hymns/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM hymns WHERE id = $1', [req.params.id]);
    res.json({ message: "تم الحذف" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on ${PORT}`));