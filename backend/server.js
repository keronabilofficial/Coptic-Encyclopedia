const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// إعداد المنفذ (Port) بشكل ديناميكي لـ Railway
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    'http://localhost:3000', // عشان الموقع يفضل شغال معاك على جهازك وقت التطوير
    'https://coptic-encyclopedia-production.up.railway.app' // رابط الواجهة بتاعك على Railway
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// الاتصال بقاعدة البيانات باستخدام المتغيرات البيئية (أكثر أماناً)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDatabase() {
  try {
    console.log('⏳ جاري التحقق من هيكلة جداول قاعدة البيانات السحابية...');
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
        text_coptic TEXT,
        text_arabic_coptic TEXT,
        text_arabic TEXT,
        audio_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ قاعدة البيانات مستقرة وجاهزة للعمل!');
  } catch (err) {
    console.error('❌ خطأ أثناء تهيئة قاعدة البيانات:', err.message);
  }
}
initDatabase();

// ==================== الـ API Endpoints ====================

app.post('/api/seasons', async (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ error: "برجاء كتابة اسم الموسم والرمز الفريد" });
  try {
    const queryText = `INSERT INTO seasons (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING RETURNING *`;
    const result = await pool.query(queryText, [name, slug]);
    if (result.rows.length === 0) return res.status(400).json({ error: "هذا الرمز مسجل بالفعل لموسم آخر!" });
    res.status(201).json({ message: "تم إضافة الموسم الطقسي بنجاح!", season: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "فشل حفظ الموسم: " + err.message });
  }
});

app.get('/api/seasons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM seasons ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "خطأ في جلب المواسم: " + err.message });
  }
});

app.get('/api/hymns', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hymns ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "خطأ في جلب الألحان: " + err.message });
  }
});

app.get('/api/seasons/:slug/hymns', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query('SELECT * FROM hymns WHERE season_slug = $1 ORDER BY id DESC', [slug]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "خطأ في جلب ألحان الموسم: " + err.message });
  }
});

app.get('/api/hymns/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM hymns WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "اللحن غير موجود" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "خطأ في جلب اللحن: " + err.message });
  }
});

app.post('/api/hymns', async (req, res) => {
  const { season_slug, title, liturgy_type, ritual_notes, text_coptic, text_arabic_coptic, text_arabic, audio_url } = req.body;
  if (!season_slug || !title) return res.status(400).json({ error: "برجاء اختيار الموسم واسم اللحن أولاً" });
  try {
    const queryText = `
      INSERT INTO hymns (season_slug, title, liturgy_type, ritual_notes, text_coptic, text_arabic_coptic, text_arabic, audio_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `;
    const result = await pool.query(queryText, [season_slug, title, liturgy_type, ritual_notes, text_coptic, text_arabic_coptic, text_arabic, audio_url]);
    res.status(201).json({ message: "تم حفظ اللحن بنجاح!", hymn: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "فشل حفظ اللحن: " + err.message });
  }
});

app.put('/api/hymns/:id', async (req, res) => {
  const { id } = req.params;
  const { season_slug, title, liturgy_type, ritual_notes, text_coptic, text_arabic_coptic, text_arabic, audio_url } = req.body;
  try {
    const queryText = `
      UPDATE hymns 
      SET season_slug=$1, title=$2, liturgy_type=$3, ritual_notes=$4, text_coptic=$5, text_arabic_coptic=$6, text_arabic=$7, audio_url=$8
      WHERE id=$9 RETURNING *
    `;
    const result = await pool.query(queryText, [season_slug, title, liturgy_type, ritual_notes, text_coptic, text_arabic_coptic, text_arabic, audio_url, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "اللحن غير موجود" });
    res.json({ message: "تم تحديث وتعديل اللحن بنجاح!", hymn: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "فشل تحديث اللحن: " + err.message });
  }
});

app.delete('/api/hymns/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM hymns WHERE id = $1', [id]);
    res.json({ message: "تم حذف اللحن من الموسوعة بنجاح!" });
  } catch (err) {
    res.status(500).json({ error: "فشل حذف اللحن: " + err.message });
  }
});

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const result = await pool.query(`SELECT id, title, season_slug FROM hymns WHERE title LIKE $1 OR text_arabic LIKE $1 LIMIT 10`, [`%${q}%`]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تشغيل السيرفر مرة واحدة فقط
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});