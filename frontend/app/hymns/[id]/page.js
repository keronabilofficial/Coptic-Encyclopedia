'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function HymnDetailsPage() {
  const { id } = useParams();
  const [hymn, setHymn] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // حالات التحكم التفاعلية
  const [fontSize, setFontSize] = useState(18); 
  const [isDarkMode, setIsDarkMode] = useState(false); 

  // رابط الـ API الديناميكي
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!id) return;
    
    fetch(`${API_URL}/api/hymns/${id}`)
      .then(res => res.json())
      .then(data => { setHymn(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [id, API_URL]);

  if (loading) return <div className="min-h-screen bg-[#f7f4eb] flex items-center justify-center text-[#8c7463]">جاري فك رموز المخطوطة الشريفة...</div>;
  if (!hymn) return <div className="min-h-screen bg-[#f7f4eb] flex items-center justify-center text-red-800">اللحن غير موجود</div>;

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${isDarkMode ? 'bg-[#121212] text-[#e0e0e0]' : 'bg-[#f7f4eb] text-[#3d2a1d]'}`} dir="rtl">
      
      {/* هيدر الصفحة */}
      <header className={`py-6 text-center border-b-4 relative px-4 ${isDarkMode ? 'bg-[#1a1a1a] border-[#8c6d1d] text-[#f2cc8f]' : 'bg-[#5c0612] text-[#f2cc8f] border-[#d4af37]'}`}>
        <button onClick={() => window.history.back()} className="absolute right-4 top-5 bg-black/30 text-white px-3 py-1 rounded-lg text-xs">رجوع</button>
        <span className="text-xs block mb-1">✥ {hymn.liturgy_type || 'لحن طقسي'} ✥</span>
        <h1 className="text-xl md:text-2xl font-bold font-serif">{hymn.title}</h1>
      </header>

      {/* شريط أدوات التحكم التفاعلي العائم */}
      <div className={`sticky top-0 z-50 px-4 py-2 flex justify-between items-center border-b shadow-sm ${isDarkMode ? 'bg-[#222] border-neutral-800' : 'bg-[#fcfaf5] border-[#e8e2d5]'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">حجم نصوص المخطوطة:</span>
          <button onClick={() => setFontSize(prev => Math.min(prev + 2, 32))} className="bg-gray-200 text-black font-bold px-3 py-1 rounded text-sm hover:bg-gray-300">A+</button>
          <button onClick={() => setFontSize(prev => Math.max(prev - 2, 14))} className="bg-gray-200 text-black font-bold px-3 py-1 rounded text-sm hover:bg-gray-300">A-</button>
          <span className="text-xs font-mono px-1">({fontSize}px)</span>
        </div>
        
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${isDarkMode ? 'bg-amber-400 text-black' : 'bg-neutral-900 text-white'}`}
        >
          {isDarkMode ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي (تعتيم الكنيسة)'}
        </button>
      </div>

      {/* المحتوى والمخطوطة */}
      <main className="container mx-auto px-4 py-6 max-w-5xl flex-grow space-y-6">
        
        {/* مشغل الصوت والطقس */}
        <div className={`border-2 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800' : 'bg-[#faf8f5] border-[#e8e2d5]'}`}>
          <div className="md:col-span-2 space-y-1">
            <span className="block text-xs font-bold">التسجيل التعليمي الصوتي المعتمد:</span>
           {hymn.audio_url ? (
  <audio controls className="w-full accent-[#5c0612]" key={hymn.audio_url}>
    <source 
      src={hymn.audio_url} 
      type="audio/webm" 
    />
    متصفحك لا يدعم تشغيل هذا الملف الصوتي.
  </audio>
) : (
  <div className="text-xs text-gray-500 text-center py-2 border border-dashed rounded-xl">
    🔒 لم يتم ربط ملف صوتي تعليمي لهذا اللحن بعد.
  </div>
)}
          </div>
          <div className={`p-3 rounded-xl text-xs leading-relaxed ${isDarkMode ? 'bg-neutral-900 text-gray-400' : 'bg-white text-[#735640]'}`}>
            <span className="block font-bold text-amber-500 mb-0.5">✥ عوائد الطقس والأداء:</span>
            {hymn.ritual_notes || 'لا توجد توجيهات خاصة، يرتل حسب النظام السنوي المعتاد.'}
          </div>
        </div>

        {/* المخطوطة الثلاثية المتجاوبة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ fontSize: `${fontSize}px` }}>
          
          {/* العمود الأول: النص القبطي */}
          <div className={`border-2 rounded-2xl p-5 shadow-sm text-center transition-colors ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800 text-blue-300' : 'bg-white border-[#e8e2d5] text-indigo-950'}`}>
            <div className="text-xs font-bold mb-3 border-b pb-1 opacity-60">COPTIC TEXT</div>
            <p className="font-serif leading-loose text-right whitespace-pre-wrap select-all" style={{ wordSpacing: '2px' }} dir="ltr">
              {hymn.text_coptic || '---'}
            </p>
          </div>

          {/* العمود الثاني: القبطي المعرب */}
          <div className={`border-2 rounded-2xl p-5 shadow-sm text-center transition-colors ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800 text-yellow-200' : 'bg-white border-[#e8e2d5] text-[#3d2a1d]'}`}>
            <div className="text-xs font-bold mb-3 border-b pb-1 opacity-60">النطق القبطي معربا</div>
            <p className="font-sans leading-loose text-center whitespace-pre-wrap">
              {hymn.text_arabic_coptic || '---'}
            </p>
          </div>

          {/* العمود الثالث: الترجمة العربية */}
          <div className={`border-2 rounded-2xl p-5 shadow-sm text-center transition-colors ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800 text-red-300' : 'bg-white border-[#e8e2d5] text-[#5c0612]'}`}>
            <div className="text-xs font-bold mb-3 border-b pb-1 opacity-60">التفسير والترجمة العربية</div>
            <p className="font-serif leading-loose text-right whitespace-pre-wrap">
              {hymn.text_arabic || '---'}
            </p>
          </div>

        </div>
      </main>

      <footer className={`py-4 text-center text-xs border-t-2 ${isDarkMode ? 'bg-[#1a1a1a] border-[#8c6d1d] text-gray-500' : 'bg-[#240105] border-[#d4af37] text-[#caa673]'}`}>
        <p>تطوير وتوثيق كيرلس نبيل </p>
      </footer>
    </div>
  );
}