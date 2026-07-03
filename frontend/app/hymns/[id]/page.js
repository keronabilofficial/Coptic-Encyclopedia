'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
// استدعاء أداة التحويل من الفولدر اللي عملته
import { convertLegacyToUnicodeCoptic } from '@/utils/copticConverter';

export default function HymnDetailPage({ params }) {
  const [hymn, setHymn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // حل الـ params لضمان التوافق مع إصدارات Next.js الحديثة
    Promise.resolve(params).then((resolvedParams) => {
      const id = resolvedParams.id;
      
      fetch(`${API_URL}/api/hymns/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('فشل في جلب بيانات اللحن من السيرفر');
          return res.json();
        })
        .then((data) => {
          // تحويل وتأمين كل النصوص القبطية القادمة من الداتابيز قبل عرضها
          setHymn({
            ...data,
            title: convertLegacyToUnicodeCoptic(data.title),
            context: convertLegacyToUnicodeCoptic(data.context || data.description),
            lyrics: convertLegacyToUnicodeCoptic(data.lyrics)
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching hymn detail:", err);
          setError(err.message);
          setLoading(false);
        });
    });
  }, [params]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50" dir="rtl">
      <div className="text-3xl mb-4 text-amber-700 animate-spin">✥</div>
      <div className="text-xl font-bold text-stone-700 animate-pulse">جاري تحميل نص اللحن الطقسي...</div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 p-4" dir="rtl">
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl max-w-md text-center shadow-sm">
        <p className="text-xl font-bold mb-2">عذراً، تعذر عرض اللحن</p>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Link href="/" className="inline-block bg-amber-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-800 transition-colors">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-stone-50 text-stone-800 pb-16" dir="rtl">
      {/* الهيدر العلوي وزر الرجوع */}
      <div className="bg-gradient-to-b from-amber-900 to-stone-900 text-amber-100 py-12 px-4 text-center shadow-md relative border-b-4 border-amber-600">
        <div className="max-w-3xl mx-auto relative z-10">
          <Link href="/" className="absolute right-0 top-0 text-amber-400 hover:text-white transition-colors text-sm font-bold bg-amber-950/50 px-3 py-1.5 rounded-lg border border-amber-800">
            ← عودة للموسوعة
          </Link>
          <div className="text-3xl mb-2 text-amber-500 font-serif">✥</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide mb-2 drop-shadow">
            {hymn?.title}
          </h1>
          <span className="inline-block bg-amber-800/60 text-amber-200 text-xs px-3 py-1 rounded-full font-bold border border-amber-700">
            {hymn?.liturgy_type || hymn?.season || 'لحن طقسي'}
          </span>
        </div>
      </div>

      {/* محتوى اللحن والكلمات */}
      <div className="max-w-3xl mx-auto mt-8 px-4">
        {/* الشرح أو المناسبة الطقسية */}
        {hymn?.context && (
          <div className="bg-amber-50/60 border-r-4 border-amber-700 rounded-l-xl p-4 mb-6 shadow-sm">
            <h3 className="text-sm font-bold text-amber-900 mb-1">الترتيب والطقس الكنسي:</h3>
            <p className="text-stone-700 text-sm leading-relaxed font-medium whitespace-pre-line">
              {hymn.context}
            </p>
          </div>
        )}

        {/* صندوق الكلمات القبطية بعد تحويلها لليونيكود الحقيقي */}
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-700"></div>
          
          <h2 className="text-center text-stone-400 text-xs font-bold tracking-widest mb-6 uppercase">نص اللحن باللغة القبطية</h2>
          
          <div className="text-2xl md:text-3xl text-stone-900 text-center leading-loose font-serif tracking-wide whitespace-pre-line selection:bg-amber-100">
            {hymn?.lyrics}
          </div>
        </div>
      </div>
    </main>
  );
}