'use client';
import { useState, useEffect } from 'react';
import { convertLegacyToUnicodeCoptic } from '../utils/copticConverter';
const ADMIN_SECRET_PASSWORD = "Abo@Filumina@6101996";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [seasons, setSeasons] = useState([]);
  const [hymns, setHymns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = {
    season_slug: '', title: '', liturgy_type: 'سنوي', ritual_notes: '',
    performance_style: '', text_coptic: '', text_arabic_coptic: '',
    text_arabic: '', audio_url: ''
  };
  const [form, setForm] = useState(initialForm);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 1. التحقق من الأوثنتيكيشن عند تحميل الصفحة لمنع القفل مع الريفريش
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // 2. دالة جلب البيانات الموحدة الذكية (بتنظف الخطوط فوراً)
  const loadData = async () => {
    try {
      setLoading(true);
      const resS = await fetch(`${API_URL}/api/seasons`);
      const resH = await fetch(`${API_URL}/api/hymns`);
      
      if (!resS.ok || !resH.ok) throw new Error('فشل في جلب البيانات من السيرفر');
      
      const seasonsData = await resS.json();
      const hymnsData = await resH.json();

      // تنظيف نصوص الألحان بالكامل بناءً على حقول الـ Schema الحقيقية بتاعتك
      const cleanedHymns = hymnsData.map(hymn => ({
        ...hymn,
        title: convertLegacyToUnicodeCoptic(hymn.title),
        ritual_notes: convertLegacyToUnicodeCoptic(hymn.ritual_notes),
        performance_style: convertLegacyToUnicodeCoptic(hymn.performance_style),
        text_coptic: convertLegacyToUnicodeCoptic(hymn.text_coptic)
      }));

      setSeasons(seasonsData);
      setHymns(cleanedHymns);
      setError(null);
    } catch (err) { 
      console.error(err); 
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // جلب البيانات أول مرة عند دخول الأدمن بنجاح
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // 3. معالجة الإرسال (إضافة أو تعديل)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `${API_URL}/api/hymns/${editingId}` : `${API_URL}/api/hymns`;
    
    try {
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('حدث خطأ أثناء حفظ البيانات');

      alert("تم الحفظ بنجاح!");
      setEditingId(null);
      setForm(initialForm);
      loadData(); // إعادة تحميل وتنظيف البيانات المحدثة
    } catch (err) {
      alert(err.message);
    }
  };

  // 4. حذف لحن
  const deleteHymn = async (id) => {
    if(!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`${API_URL}/api/hymns/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل الحذف من السيرفر');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // شاشة الدخول
  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-[#5c0612]">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full mx-4">
        <h2 className="text-black font-bold text-xl mb-4">بوابة الإدارة الطقسية</h2>
        <input 
          type="password" 
          onChange={(e) => setPasswordInput(e.target.value)} 
          className="w-full border-2 p-3 rounded-lg mb-4 text-center text-black outline-none focus:border-red-900" 
          placeholder="كلمة المرور" 
        />
        <button 
          onClick={() => {
            if (passwordInput === ADMIN_SECRET_PASSWORD) {
              sessionStorage.setItem('auth', 'true'); 
              setIsAuthenticated(true);
            } else {
              alert('كلمة المرور غير صحيحة!');
            }
          }} 
          className="w-full bg-[#5c0612] text-white p-3 rounded-lg font-bold hover:bg-red-9load5 transition-colors"
        >
          دخول
        </button>
      </div>
    </div>
  );

  const inputStyle = "w-full p-3 border-2 border-gray-300 rounded-lg text-black bg-white focus:border-red-900 outline-none transition-colors";

  if (loading && hymns.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4eb] text-[#5c0612] font-bold text-xl">
      جاري تحميل لوحة التحكم...
    </div>
  );

  return (
    <div className="p-6 bg-[#f7f4eb] min-h-screen" dir="rtl">
      <div className="flex justify-between items-center mb-8 border-b-2 border-[#d4af37] pb-4">
        <h1 className="text-3xl font-bold text-[#5c0612]">لوحة تدوين الألحان</h1>
        <button 
          onClick={() => { sessionStorage.removeItem('auth'); setIsAuthenticated(false); }} 
          className="bg-stone-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          تسجيل خروج
        </button>
      </div>
      
      {error && <div className="bg-red-100 text-red-800 p-4 rounded-xl mb-6 font-bold">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border-2 border-[#d4af37] shadow-lg mb-10 space-y-4">
        <h2 className="font-bold text-xl text-[#5c0612]">{editingId ? 'تعديل لحن حالي' : 'إضافة لحن جديد'}</h2>
        
        <select className={inputStyle} onChange={(e) => setForm({...form, season_slug: e.target.value})} value={form.season_slug}>
           <option value="">-- اختر الموسم الكنسي --</option>
           {seasons.map(s => <option key={s.id || s._id} value={s.slug}>{s.name}</option>)}
        </select>
        
        <input className={inputStyle} placeholder="اسم اللحن" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
        <input className={inputStyle} placeholder="عوائد الطقس والمناسبة" value={form.ritual_notes} onChange={(e) => setForm({...form, ritual_notes: e.target.value})} />
        <input className={inputStyle} placeholder="طريقة الأداء واللحن" value={form.performance_style} onChange={(e) => setForm({...form, performance_style: e.target.value})} />
        
        {/* حقل القبطي: يفضل نمرر الدالة جوه الـ onChange عشان يقلب يونيكود فوراً وإنت بتعمل Paste لحماية الداتابيز برضه */}
        <textarea 
          className={inputStyle} 
          rows={4}
          placeholder="النص القبطي (انسخ هنا السيستم هيصلحه تلقائياً)" 
          value={form.text_coptic} 
          onChange={(e) => setForm({...form, text_coptic: convertLegacyToUnicodeCoptic(e.target.value)})} 
        />
        
        <textarea className={inputStyle} rows={3} placeholder="النطق القبطي معرباً (مثال: أوزيوس استين...)" value={form.text_arabic_coptic} onChange={(e) => setForm({...form, text_arabic_coptic: e.target.value})} />
        <textarea className={inputStyle} rows={3} placeholder="الترجمة العربية التفسيرية" value={form.text_arabic} onChange={(e) => setForm({...form, text_arabic: e.target.value})} />
        <input className={inputStyle} placeholder="رابط الملف الصوتي (سيرفر خارجي أو Drive)" value={form.audio_url} onChange={(e) => setForm({...form, audio_url: e.target.value})} />
        
        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-[#5c0612] text-[#f2cc8f] p-4 rounded-xl font-bold text-lg hover:bg-red-950 transition-colors">
            {editingId ? 'حفظ التعديلات الحالية' : 'تأكيد إضافة اللحن الموسوعي'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }} className="bg-stone-400 text-stone-900 px-6 rounded-xl font-bold">
              إلغاء التعديل
            </button>
          )}
        </div>
      </form>

      {/* جدول عرض الألحان المتاح التحكم بها */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#5c0612] text-white">
              <th className="p-4">اسم اللحن بالموسوعة</th>
              <th className="p-4 text-center">أدوات التحكم وإدارة النص</th>
            </tr>
          </thead>
          <tbody>
            {hymns.map(h => (
              <tr key={h.id || h._id} className="border-b border-gray-200 hover:bg-stone-50">
                <td className="p-4 font-bold text-black">{h.title}</td>
                <td className="p-4 flex gap-2 justify-center">
                  <button 
                    onClick={() => { setEditingId(h.id || h._id); setForm(h); window.scrollTo({top:0, behavior:'smooth'}); }} 
                    className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    تعديل
                  </button>
                  <button 
                    onClick={() => deleteHymn(h.id || h._id)} 
                    className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {hymns.length === 0 && (
              <tr>
                <td colSpan="2" className="p-8 text-center text-stone-500 font-bold">لا يوجد ألحان مسجلة حالياً.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}