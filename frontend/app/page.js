'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// تعديل المسار ليكون نسبياً صريحاً متوافقاً مع مكان الفولدر الجديد داخل الـ frontend
import { convertLegacyToUnicodeCoptic } from '../utils/copticConverter';

export default function Home() {
  // متغيرات الحالة الأساسية
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🛠️ حل المشكلة: تعريف الـ States الناقصة للألحان التي تسببت في الـ ReferenceError
  const [hymns, setHymns] = useState([]);
  const [filteredHymns, setFilteredHymns] = useState([]);
  
  // متغيرات حالة البحث الفوري
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // قراءة رابط الباكيند من ملف البيئة المحلي
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

  // جلب البيانات فور تشغيل الصفحة
  useEffect(() => {
    fetch(`${API_URL}/api/hymns`)
      .then((res) => {
        if (!res.ok) throw new Error('فشل في جلب البيانات من السيرفر');
        return res.json();
      })
      .then((data) => {
        // تنظيف وتحويل النصوص القبطية بداخل الألحان
        const cleanedData = data.map(hymn => ({
          ...hymn,
          title: convertLegacyToUnicodeCoptic(hymn.title),
          context: convertLegacyToUnicodeCoptic(hymn.context || hymn.description || ''),
          lyrics: convertLegacyToUnicodeCoptic(hymn.lyrics || '')
        }));

        // تعيين الألحان في الـ State بنجاح
        setHymns(cleanedData);
        setFilteredHymns(cleanedData);

        // استخراج المواسم الفريدة من البيانات لبناء القائمة الطقسية
        const dbSeasons = cleanedData.map(hymn => hymn.liturgy_type || hymn.season).filter(Boolean);
        const uniqueSeasonsNames = [...new Set(dbSeasons)];
        
        // تحويلها لهيكل بيانات يناسب الـ الكروت المعروضة (id, name, slug)
        const formattedSeasons = uniqueSeasonsNames.map((seasonName, index) => ({
          id: index + 1,
          name: seasonName,
          slug: encodeURIComponent(seasonName.toLowerCase().replace(/\s+/g, '-'))
        }));

        setSeasons(formattedSeasons);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching hymns:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [API_URL]);

  // دالة محرك البحث الذكي الفوري عند الكتابة
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 0) {
      setIsSearching(true);
      fetch(`${API_URL}/api/search?q=${encodeURIComponent(value)}`)
        .then((res) => res.json())
        .then((data) => {
          // تنظيف نتائج البحث أيضاً لتعرض بالخط القبطي الصحيح
          const cleanedSearch = data.map(hymn => ({
            ...hymn,
            title: convertLegacyToUnicodeCoptic(hymn.title)
          }));
          setSearchResults(cleanedSearch);
          setIsSearching(false);
        })
        .catch((err) => {
          console.error(err);
          setIsSearching(false);
        });
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4eb] text-[#3d2a1d] flex flex-col justify-between" dir="rtl">
      
      {/* هيدر الموسوعة */}
      <header className="bg-[#5c0612] text-[#f2cc8f] py-10 shadow-xl text-center relative px-4 border-b-4 border-[#d4af37]">
        
        {/* اللوجو الحصري الهندي القديم */}
        <div className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
          <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" stroke="#d4af37" strokeWidth="2.5" fill="none" />
            <circle cx="50" cy="50" r="41" stroke="#f2cc8f" strokeWidth="1" strokeDasharray="3 1" fill="none" opacity="0.7" />
            
            <rect x="47" y="22" width="6" height="56" rx="2" fill="#d4af37" />
            <rect x="22" y="47" width="56" height="6" rx="2" fill="#d4af37" />
            
            <circle cx="50" cy="17" r="3.5" fill="#f2cc8f" stroke="#d4af37" strokeWidth="1" />
            <circle cx="44" cy="20" r="3.5" fill="#f2cc8f" stroke="#d4af37" strokeWidth="1" />
            <circle cx="56" cy="20" r="3.5" fill="#f2cc8f" stroke="#d4af37" strokeWidth="1" />
            
            <circle cx="50" cy="83" r="3.5" fill="#f2cc8f" stroke="#d4af37" strokeWidth="1" />
            <circle cx="44" cy="80" r="3.5" fill="#f2cc8f" stroke="#d4af37" strokeWidth="1" />
            <circle cx="56" cy="80" r="3.5" fill="#f2cc8f" stroke="#d4af37" strokeWidth="1" />
            
            <circle cx="17" cy="50" r="3.5" fill="#f2cc8f" stroke="#d4af37" strokeWidth="1" />
            <circle cx="20" cy="44" r="3.5" fill="#f2cc8f" stroke="#d4af37" strokeWidth="1" />
            <circle cx="20" cy="56" r="3.5" fill="#f2cc8f" stroke="#d4af37" strokeWidth="1" />
            
            <circle cx="83" cy="50" r="3.5" fill="#f2cc8f" stroke="#d4af37" strokeWidth="1" />
            <circle cx="80" cy="44" r="3.5" fill="#f2cc8f" stroke="#d4af37" strokeWidth="1" />
            <circle cx="80" cy="56" r="3.5" fill="#f2cc8f" stroke="#d4af37" strokeWidth="1" />
            
            <circle cx="50" cy="50" r="9" fill="#5c0612" stroke="#d4af37" strokeWidth="2" />
            <path d="M47,50 L53,50 M50,47 L50,53" stroke="#f2cc8f" strokeWidth="1.5" />

            <circle cx="34" cy="34" r="2" fill="#d4af37" opacity="0.8" />
            <circle cx="66" cy="34" r="2" fill="#d4af37" opacity="0.8" />
            <circle cx="34" cy="66" r="2" fill="#d4af37" opacity="0.8" />
            <circle cx="66" cy="66" r="2" fill="#d4af37" opacity="0.8" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-wide drop-shadow-md">موسوعة الألحان القبطية الأرثوذكسية</h1>
        <div className="text-xl text-[#d4af37] mt-1">✥ ✥ ✥</div>

        {/* شريط البحث الفوري */}
        <div className="mt-8 max-w-md mx-auto relative px-2">
          <input 
            type="text"
            placeholder="ابحث عن لحن، ذكصولوجية، أو كلمة طقسية..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-[#faf8f5] text-[#3d2a1d] rounded-xl pl-4 pr-10 py-3 text-sm shadow-md border-2 border-[#d4af37]/60 focus:outline-none focus:border-[#5c0612] focus:ring-1 focus:ring-[#5c0612]"
          />
          
          {/* كشف نتائج البحث */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute right-2 left-2 mt-2 bg-[#faf8f5] rounded-xl shadow-2xl border-2 border-[#d4af37] z-50 text-right overflow-hidden max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-sm text-[#8c7463] text-center animate-pulse">جاري فحص المخطوطات والطقوس...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-sm text-[#8c7463] text-center">لم نعثر على هذا النص في الموسوعة بعد.</div>
              ) : (
                <div className="divide-y divide-[#e8e2d5]">
                  {searchResults.map((hymn) => (
                    <Link 
                      key={hymn.id} 
                      href={`/hymns/${hymn.id}`}
                      className="p-3 block hover:bg-[#f2cc8f]/30 transition-colors group"
                    >
                      <div className="font-bold text-[#5c0612] group-hover:text-[#a1182a] text-sm">✥ {hymn.title}</div>
                      <div className="text-xs text-[#735640] mt-1 flex justify-between">
                        <span>{hymn.liturgy_type || hymn.season}</span>
                        <span className="font-mono bg-[#e8e2d5] px-2 py-0.5 rounded text-[10px]">{hymn.season_slug || 'ritual'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* المحتوى الرئيسي للمواسم الطقسية */}
      <main className="container mx-auto px-4 py-12 max-w-5xl flex-grow">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-[#d4af37] text-xl">✥</span>
          <h2 className="text-2xl font-bold font-serif text-[#5c0612] tracking-wide px-4">
            الفصول والمواسم الطقسية
          </h2>
          <span className="text-[#d4af37] text-xl">✥</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-lg font-medium text-[#8c7463] animate-pulse">
            جاري فتح الموسوعة وتهيئة الطقوس الشريفة...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
            ❌ حدث خطأ أثناء تحميل الطقوس: {error}
          </div>
        ) : seasons.length === 0 ? (
          <div className="text-center py-20 text-sm text-[#8c7463]">
            لم يتم العثور على مواسم، تأكد من تشغيل السيرفر وقاعدة البيانات بنجاح.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seasons.map((season) => (
              <Link 
                href={`/seasons/${season.slug}`}
                key={season.id} 
                className="bg-[#faf8f5] border-2 border-[#e8e2d5] rounded-xl p-6 shadow-sm hover:shadow-xl hover:border-[#d4af37] hover:bg-white transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden before:absolute before:top-0 before:right-0 before:w-2 before:h-full before:bg-[#5c0612]"
              >
                <div>
                  <div className="text-[#d4af37] text-2xl mb-2 group-hover:scale-110 transition-transform">✥</div>
                  <h3 className="text-lg font-bold text-[#5c0612] group-hover:text-[#a1182a] transition-colors font-serif">
                    {season.name}
                  </h3>
                </div>
                <span className="text-[11px] text-[#8c7463] mt-4 block uppercase font-mono tracking-wider">
                  ✦ {season.slug}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* الفوتر */}
      <footer className="bg-[#240105] text-[#caa673] py-8 text-center border-t-2 border-[#d4af37] text-xs">
        <p className="mb-2 font-serif tracking-wide text-[#f2cc8f]/80 text-sm">✥ كل شيء فليكن ببنيان ونظام طقسي مقدس ✥</p>
        <p className="font-sans opacity-60">
          &copy; {new Date().getFullYear()} كيرلس نبيل. جميع الحقوق محفوظة للموسوعة الطقسية.
        </p>
      </footer>

    </div>
  );
}