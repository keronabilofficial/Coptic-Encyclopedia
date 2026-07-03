const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function insertSampleHymn() {
    try {
        console.log('⏳ جاري إدخال لحن تجريبي كامل...');

        // 1. جلب الـ ID الخاص بالموسم السنوي
        const seasonRes = await pool.query("SELECT id FROM seasons WHERE slug = 'annual'");
        const annualSeasonId = seasonRes.rows[0].id;

        // 2. إدخال بيانات اللحن الأساسية
        const hymnInsert = await pool.query(`
            INSERT INTO hymns (season_id, title, liturgy_type, audio_url, ritual_notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `, [
            annualSeasonId, 
            'لحن إبؤورو (يا ملك السلام)', 
            'التوزيع', 
            'https://example.com/audio/epouro.mp3', 
            'يُقال في التوزيع السنوي بـ النغمة السنوية المعتادة.'
        ]);
        
        const newHymnId = hymnInsert.rows[0].id;

        // 3. إدخال النصوص المتوازية (الربع الأول كمثال دقيق)
        await pool.query(`
            INSERT INTO lyrics (hymn_id, order_index, coptic_text, arabized_coptic, arabic_translation)
            VALUES ($1, $2, $3, $4, $5);
        `, [
            newHymnId,
            1,
            'Ⲡⲟⲩⲣⲟ ⲛⲧⲉ ϯϩⲓⲣⲏⲛⲏ: ⲙⲟⲓ ⲛⲁⲛ ⲛⲧⲉⲕϩⲓⲣⲏⲛⲏ: ⲥⲉⲙⲛⲓ ⲛⲁⲛ ⲛⲧⲉⲕϩⲓⲣⲏⲛⲏ: ⲭⲁ ⲛⲉⲛⲛⲟⲃⲓ ⲛⲁⲛ ⲉⲃⲟlambda.',
            'إبؤورو إنتيه تي هيريني: موي نان إنتيك هيريني: سيمني نان إنتيك هيريني: كا نين نوفى نان إفول.',
            'يا ملك السلام أعطنا سلامك: قرر لنا سلامك: واغفر لنا خطايانا.'
        ]);

        console.log('🎉 تم إدخال لحن إبؤورو بنصوصه المتوازية الثلاثة بنجاح كامل!');
    } catch (error) {
        console.error('❌ خطأ أثناء إدخال اللحن التجريبي:', error);
    } finally {
        await pool.end();
    }
}

insertSampleHymn();