'use client';
import { useEffect, useState } from 'react';

export default function HymnDetailPage({ params }) {
  const [hymn, setHymn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(params).then((resolvedParams) => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/hymns/${resolvedParams.id}`)
        .then(res => res.json())
        .then(data => {
          console.log("البيانات القادمة من السيرفر:", data); // لفحص أسماء الحقول في الـ Console
          setHymn(data);
          setLoading(false);
        });
    });
  }, [params]);

  if (loading) return <div className="text-center mt-20 text-stone-600">جاري تحميل المخطوط الطقسي...</div>;

  return (
    <main className="min-h-screen bg-stone-50 pb-10" dir="rtl">
      {/* العنوان الرئيسي */}
      <div className="bg-stone-900 text-amber-500 p-6 text-center text-2xl font-bold border-b-4 border-amber-600 mb-8 shadow-lg">
        {hymn.title}
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* مشغل الصوت */}
        {hymn.audio_url && (
          <div className="bg-white p-4 rounded-xl border border-stone-200 mb-8 shadow-sm text-center">
            <audio controls className="w-full max-w-2xl mx-auto">
              <source src={hymn.audio_url} type="audio/mpeg" />
            </audio>
          </div>
        )}

        {/* نظام الأعمدة الثلاثة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <h3 className="text-center font-bold text-amber-900 border-b pb-3 mb-4">التفسير والترجمة العربية</h3>
            <p className="whitespace-pre-line text-stone-700 leading-relaxed text-right">{hymn.text_arabic}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <h3 className="text-center font-bold text-amber-900 border-b pb-3 mb-4">النطق القبطي معرب</h3>
            <p className="whitespace-pre-line text-stone-700 leading-relaxed text-right">{hymn.text_arabic_coptic}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <h3 className="text-center font-bold text-amber-900 border-b pb-3 mb-4">النص قبطي</h3>
            <p 
              className="whitespace-pre-line text-stone-900 leading-relaxed text-left font-serif text-lg" 
              dir="ltr"
            >
              {hymn.text_coptic}
            </p>
          </div>
        </div>
      </div>

      {/* الفوتر */}
      <footer className="mt-16 py-8 text-center border-t border-stone-200 bg-stone-100">
        <p className="text-stone-600 font-medium">
          تم التطوير والتوثيق بواسطة: <span className="text-amber-900 font-bold">كيرلس نبيل</span>
        </p>
        <p className="text-stone-400 text-sm mt-1">© {new Date().getFullYear()} جميع الحقوق محفوظة</p>
      </footer>
    </main>
  );
}