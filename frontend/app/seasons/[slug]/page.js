'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [hymns, setHymns] = useState([]);
  const [filteredHymns, setFilteredHymns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('الكل');
  
  // قائمة المواسم هتبدأ بـ 'الكل' وهتتحدث تلقائياً من قاعدة البيانات
  const [seasonsList, setSeasonsList] = useState(['الكل']);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // جلب الألحان من الباكيند
    fetch(`${API_URL}/api/hymns`)
      .then((res) => {
        if (!res.ok) throw new Error('فشل في جلب البيانات من السيرفر');
        return res.json();
      })
      .then((data) => {
        setHymns(data);
        setFilteredHymns(data);

        // استخراج كل المواسم المكتوبة في الداتابيز بدون تكرار وبدون قيم فارغة
        const dbSeasons = data.map(hymn => hymn.liturgy_type || hymn.season).filter(Boolean);
        const uniqueSeasons = ['الكل', ...new Set(dbSeasons)];
        
        // تحديث أزرار التصنيفات بناءً على المواسم الحقيقية اللي إنت ضفتها
        setSeasonsList(uniqueSeasons);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching hymns:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // نظام التصفية والبحث الذكي المتطابق مع بياناتك
  useEffect(() => {
    let result = hymns;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(hymn => 
        hymn.title?.toLowerCase().includes(term) || 
        hymn.context?.toLowerCase().includes(term) ||
        hymn.lyrics?.toLowerCase().includes(term)
      );
    }

    // التصفية بناءً على الموسم المختار بالتطابق الحرفي مع قيمتك في الداتابيز
    if (selectedSeason !== 'الكل') {
      result = result.filter(hymn => {
        const hymnSeason = hymn.liturgy_type || hymn.season;
        return hymnSeason === selectedSeason;
      });
    }

    setFilteredHymns(result);
  }, [searchTerm, selectedSeason, hymns]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50" dir="rtl">
      <div className="text-3xl mb-4 text-amber-700 animate-spin">✥</div>
      <div className="text-xl font-bold text-stone-700 animate-pulse">جاري تحميل الموسوعة الطقسية للألحان...</div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 p-4" dir="rtl">
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl max-w-md text-center shadow-sm">
        <p className="text-xl font-bold mb-2">عذراً، حدث خطأ أثناء الاتصال بالقاعدة</p>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-amber-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-800 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-stone-50 text-stone-800 pb-16" dir="rtl">
      {/* خلفية الهيدر والزخرفة */}
      <div className="bg-gradient-to-b from-amber-900 via-stone-900 to-stone-900 text-amber-100 py-16 px-4 text-center shadow-lg relative border-b-4 border-amber-600">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-4xl md:text-5xl mb-4 text-amber-500 font-serif tracking-widest">✥ ☩ ✥</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide mb-3 drop-shadow">
            موسوعة الألحان القبطية الطقسية
          </h1>
          <p className="text-stone-300 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
            المرجع التعليمي الكنسي الشامل لنصوص، معاني وترتيب الصلبان والألحان الطقسية على مدار السنة التوتية.
          </p>
        </div>
      </div>

      {/* لوحة التحكم والبحث */}
      <section className="max-w-5xl mx-auto -mt-8 px-4 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-3 items-end">
            
            {/* شريط البحث المتقدم */}
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-stone-700 mb-2">البحث الذكي عن لحن:</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="اسم اللحن، كلمات من النص..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 bg-stone-50 text-stone-900 font-medium"
                />
                <span className="absolute left-3 top-3 text-stone-400">🔍</span>
              </div>
            </div>

            {/* فلاتر المواسم الكنسية الديناميكية المجلوبة من داتابيز الخاصة بك */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-stone-700 mb-2">الموسم الطقسي الكنسي:</label>
              <div className="flex flex-wrap gap-2">
                {seasonsList.map((season) => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                      selectedSeason === season 
                        ? 'bg-amber-800 text-white shadow-md transform scale-105' 
                        : 'bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-900 border border-stone-200'
                    }`}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* شبكة عرض كروت الألحان */}
      <section className="max-w-5xl mx-auto mt-12 px-4">
        <div className="flex items-center justify-between mb-6 border-b border-stone-200 pb-3">
          <h2 className="text-xl font-extrabold text-stone-800 flex items-center gap-2">
            <span className="text-amber-700">✥</span> الألحان المدرجة ({filteredHymns.length})
          </h2>
          <span className="text-xs text-stone-500 font-medium">اضغط على اللحن لعرض الكلمات والتفسير</span>
        </div>

        {filteredHymns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-stone-300 p-8">
            <div className="text-4xl mb-3 text-stone-400">☩</div>
            <p className="text-stone-500 font-bold text-lg mb-1">لم يتم العثور على ألحان تطابق بحثك حالياً.</p>
            <p className="text-stone-400 text-sm">تأكد من اختيار الموسم الصحيح أو جرب تصفح قسم آخر.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHymns.map((hymn) => (
              <Link 
                href={`/hymns/${hymn.id || hymn._id}`} 
                key={hymn.id || hymn._id} 
                className="group bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:border-amber-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-amber-600 text-lg group-hover:rotate-12 transition-transform">✥</span>
                    <span className="bg-amber-50 text-amber-800 text-xs px-3 py-1 rounded-lg font-extrabold border border-amber-100">
                      {hymn.liturgy_type || hymn.season || 'لحن طقسي'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors mb-2 leading-snug">
                    {hymn.title}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 font-medium">
                    {hymn.context || hymn.description || 'لم يتم إضافة شرح طقسي مختصر بعد لهذا اللحن.'}
                  </p>
                </div>
                
                <div className="mt-6 border-t border-stone-100 pt-3 flex items-center justify-between text-amber-700 text-xs font-extrabold group-hover:text-amber-900">
                  <span>عرض النص والشرح الطقسي</span>
                  <span className="transform group-hover:translate-x-[-4px] transition-transform">←</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* تذييل */}
      <footer className="text-center mt-24 text-xs text-stone-400 font-medium border-t border-stone-200 pt-6">
        <p>جميع الحقوق محفوظة للموسوعة الطقسية © {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}