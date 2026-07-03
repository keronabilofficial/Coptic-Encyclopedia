'use client';
import { useEffect, useState } from 'react';

// دالة التحويل من لاتيني إلى يونيكود قبطي
const convertToCopticUnicode = (text) => {
  if (!text) return "";
  const map = {
    'Tenovw2t': 'ϯⲛⲟⲩϣⲓ', // مثال: ضيف هنا الكلمات الأساسية اللي بتتكرر عندك
    'Xere': 'ⲭⲉⲣⲉ',
    'nem': 'ⲛⲉⲙ',
    'p3ri': 'ⲡⲓⲣⲓ',
    // يمكنك إضافة أي كلمات تانية بنفس الطريقة
  };
  
  let converted = text;
  Object.keys(map).forEach(key => {
    converted = converted.split(key).join(map[key]);
  });
  return converted;
};

export default function HymnDetailPage({ params }) {
  const [hymn, setHymn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(params).then((resolvedParams) => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/hymns/${resolvedParams.id}`)
        .then(res => res.json())
        .then(data => {
          setHymn(data);
          setLoading(false);
        });
    });
  }, [params]);

  if (loading) return <div className="text-center mt-20 text-stone-600">جاري تحميل المخطوط...</div>;

  return (
    <main className="min-h-screen bg-stone-50 pb-10" dir="rtl">
      {/* العنوان */}
      <div className="bg-stone-900 text-amber-500 p-6 text-center text-2xl font-bold border-b-4 border-amber-600 mb-8">
        {hymn.title}
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* الأعمدة الثلاثة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-stone-200">
            <h3 className="text-center font-bold text-amber-900 border-b pb-3 mb-4">التفسير والترجمة</h3>
            <p className="text-stone-700 leading-relaxed text-right">{hymn.text_arabic}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-stone-200">
            <h3 className="text-center font-bold text-amber-900 border-b pb-3 mb-4">النطق القبطي</h3>
            <p className="text-stone-700 leading-relaxed text-right">{hymn.text_arabic_coptic}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-stone-200">
            <h3 className="text-center font-bold text-amber-900 border-b pb-3 mb-4">COPTIC TEXT</h3>
            {/* هنا بيتم التحويل أوتوماتيكياً */}
            <p className="text-stone-900 text-left font-serif text-lg leading-loose" dir="ltr">
              {convertToCopticUnicode(hymn.text_coptic)}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}