const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function initializeDatabase() {
    try {
        console.log('⏳ جاري تهيئة وإنشاء جداول الموسوعة القبطية...');

        // 1. إنشاء جدول المواسم الطقسية
        await pool.query(`
            CREATE TABLE IF NOT EXISTS seasons (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                slug VARCHAR(100) NOT NULL UNIQUE
            );
        `);
        console.log('🔹 تم إنشاء جدول المواسم الطقسية (seasons) بنجاح.');

        // 2. إنشاء جدول الألحان الرئيسية
        await pool.query(`
            CREATE TABLE IF NOT EXISTS hymns (
                id SERIAL PRIMARY KEY,
                season_id INT REFERENCES seasons(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                liturgy_type VARCHAR(100),
                audio_url TEXT,
                ritual_notes TEXT
            );
        `);
        console.log('🔹 تم إنشاء جدول الألحان (hymns) بنجاح.');

        // 3. إنشاء جدول النصوص المتوازية
        await pool.query(`
            CREATE TABLE IF NOT EXISTS lyrics (
                id SERIAL PRIMARY KEY,
                hymn_id INT REFERENCES hymns(id) ON DELETE CASCADE,
                order_index INT NOT NULL,
                coptic_text TEXT,
                arabized_coptic TEXT,
                arabic_translation TEXT
            );
        `);
        console.log('🔹 تم إنشاء جدول النصوص المتوازية (lyrics) بنجاح.');

        // 4. ضخ المواسم الطقسية الأساسية للكنيسة في الجدول إذا لم تكن موجودة
        const seasonsCheck = await pool.query('SELECT COUNT(*) FROM seasons');
        if (parseInt(seasonsCheck.rows[0].count) === 0) {
            const insertSeasonsQuery = `
                INSERT INTO seasons (name, slug) VALUES 
                ('الألحان السنوية', 'annual'),
                ('الطقس الكيهكي', 'kiahk'),
                ('الصوم الكبير', 'great-fast'),
                ('أسبوع الآلام', 'pascha'),
                ('عيد القيامة والخماسين المقدسة', 'resurrection-and-pentecost'),
                ('الأعياد السيدية والتذكارات', 'feasts'),
                ('الألحان الجنايزية', 'funereal');
            `;
            await pool.query(insertSeasonsQuery);
            console.log('🎉 تم إدخال المواسم الطقسية الأساسية بنجاح!');
        }

        console.log('✅ قاعدة البيانات جاهزة تماماً ومصممة هندسياً بنجاح واحترافية!');
    } catch (error) {
        console.error('❌ خطأ أثناء تهيئة قاعدة البيانات:', error);
    } finally {
        await pool.end();
    }
}

initializeDatabase();