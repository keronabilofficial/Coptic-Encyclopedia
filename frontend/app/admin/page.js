'use client';
import { useState, useEffect } from 'react';

const ADMIN_SECRET_PASSWORD = "Abo@Filumina@6101996"; 

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [seasons, setSeasons] = useState([]);
  const [hymns, setHymns] = useState([]);
  const [editingHymnId, setEditingHymnId] = useState(null);
  
  const [seasonFormData, setSeasonFormData] = useState({ name: '', slug: '' });
  const [isSeasonSubmitting, setIsSeasonSubmitting] = useState(false);

  const [hymnFormData, setHymnFormData] = useState({
    season_slug: '',
    title: '',
    liturgy_type: 'سنوي',
    ritual_notes: '',
    text_coptic: '',
    text_arabic_coptic: '',
    text_arabic: '',
    audio_url: ''
  });
  const [isHymnSubmitting, setIsHymnSubmitting] = useState(false);

  useEffect(() => {
    const isAlreadyAuth = sessionStorage.getItem('hymns_admin_authenticated');
    if (isAlreadyAuth === 'true') setIsAuthenticated(true);
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const resSeasons = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/seasons');
      const dataSeasons = await resSeasons.json();
      setSeasons(dataSeasons);

      const resHymns = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/seasons');
      const dataHymns = await resHymns.json();
      setHymns(dataHymns);
    } catch (err) {
      console.error('خطأ في جلب البيانات:', err);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_SECRET_PASSWORD) {
      sessionStorage.setItem('hymns_admin_authenticated', 'true');
      setIsAuthenticated(true);
    } else {
      setAuthError('❌ عفوا، كلمة المرور غير صحيحة!');
    }
  };

  const handleSeasonSubmit = async (e) => {
    e.preventDefault();
    if (!seasonFormData.name || !seasonFormData.slug) return;
    setIsSeasonSubmitting(true);
    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seasonFormData)
      });
      if (!res.ok) throw new Error("فشل إضافة الموسم");
      setSeasons(prev => [...prev, seasonFormData]);
      setSeasonFormData({ name: '', slug: '' });
      alert("تم إضافة الموسم بنجاح!");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSeasonSubmitting(false);
    }
  };

  const handleHymnSubmit = async (e) => {
    e.preventDefault();
    setIsHymnSubmitting(true);
    
    const url = editingHymnId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/hymns/${editingHymnId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/hymns`;
const method = editingHymnId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hymnFormData)
      });
      if (!res.ok) throw new Error("فشل حفظ اللحن");

      setEditingHymnId(null);
      setHymnFormData({
        season_slug: '', title: '', liturgy_type: 'سنوي', ritual_notes: '',
        text_coptic: '', text_arabic_coptic: '', text_arabic: '', audio_url: ''
      });
      loadInitialData();
      alert("تم حفظ اللحن بنجاح!");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsHymnSubmitting(false);
    }
  };

  const startEditHymn = (hymn) => {
    setEditingHymnId(hymn.id);
    setHymnFormData({
      season_slug: hymn.season_slug,
      title: hymn.title,
      liturgy_type: hymn.liturgy_type,
      ritual_notes: hymn.ritual_notes,
      text_coptic: hymn.text_coptic,
      text_arabic_coptic: hymn.text_arabic_coptic,
      text_arabic: hymn.text_arabic,
      audio_url: hymn.audio_url
    });
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

 const deleteHymn = async (id) => {
  if (!confirm('هل انت متأكد من حذف هذا اللحن؟')) return;
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hymns/${id}`, { method: 'DELETE' });
    setHymns(prev => prev.filter(h => h.id !== id));
  } catch (err) {
    console.error(err);
  }
};

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#240105] flex items-center justify-center px-4" dir="rtl">
        <div className="bg-[#f7f4eb] border-2 border-[#d4af37] rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-[#5c0612] mb-4">منطقة طقسية مغلقة</h2>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input type="password" placeholder="أدخل كلمة المرور..." value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full text-center rounded-xl px-4 py-3 border" />
            {authError && <p className="text-xs text-red-600 font-bold">{authError}</p>}
            <button type="submit" className="w-full bg-[#5c0612] text-[#f2cc8f] font-bold py-3 rounded-xl">دخول ➔</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4eb] text-[#3d2a1d] pb-10" dir="rtl">
      <header className="bg-[#5c0612] text-[#f2cc8f] py-6 text-center border-b-4 border-[#d4af37]">
        <h1 className="text-2xl font-bold">لوحة تدوين الألحان</h1>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-10">
        <section className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold mb-4">✥ اضافة موسم جديد</h2>
          <form onSubmit={handleSeasonSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="اسم الموسم" value={seasonFormData.name} onChange={(e) => setSeasonFormData({...seasonFormData, name: e.target.value})} className="border rounded-xl px-3 py-2"/>
            <input placeholder="الرمز (slug)" value={seasonFormData.slug} onChange={(e) => setSeasonFormData({...seasonFormData, slug: e.target.value})} className="border rounded-xl px-3 py-2"/>
            <button type="submit" className="bg-[#5c0612] text-[#f2cc8f] rounded-xl">{isSeasonSubmitting ? 'جاري...' : 'انشاء'}</button>
          </form>
        </section>

        <section className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold mb-4">{editingHymnId ? 'تعديل لحن' : 'اضافة لحن جديد'}</h2>
          <form onSubmit={handleHymnSubmit} className="space-y-4">
            <select value={hymnFormData.season_slug} onChange={(e) => setHymnFormData({...hymnFormData, season_slug: e.target.value})} className="w-full border rounded-xl px-3 py-2">
              <option value="">-- اختر الموسم --</option>
              {seasons.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
            </select>
            <input placeholder="اسم اللحن" value={hymnFormData.title} onChange={(e) => setHymnFormData({...hymnFormData, title: e.target.value})} className="w-full border rounded-xl px-3 py-2"/>
            <input placeholder="رابط الملف الصوتي" value={hymnFormData.audio_url} onChange={(e) => setHymnFormData({...hymnFormData, audio_url: e.target.value})} className="w-full border rounded-xl px-3 py-2"/>
            <textarea placeholder="النص القبطي" value={hymnFormData.text_coptic} onChange={(e) => setHymnFormData({...hymnFormData, text_coptic: e.target.value})} className="w-full border rounded-xl px-3 py-2"></textarea>
            <textarea placeholder="الترجمة العربية" value={hymnFormData.text_arabic} onChange={(e) => setHymnFormData({...hymnFormData, text_arabic: e.target.value})} className="w-full border rounded-xl px-3 py-2"></textarea>
            <button type="submit" className="w-full bg-amber-700 text-white py-3 rounded-xl">{editingHymnId ? 'حفظ التعديلات' : 'إضافة اللحن'}</button>
          </form>
        </section>

        <section className="bg-white border rounded-2xl p-6">
          <table className="w-full text-right border-collapse">
            <thead><tr className="bg-gray-100"><th className="p-2 border">اسم اللحن</th><th className="p-2 border">التحكم</th></tr></thead>
            <tbody>
              {hymns.map(h => (
                <tr key={h.id}>
                  <td className="p-2 border">{h.title}</td>
                  <td className="p-2 border space-x-2">
                    <button onClick={() => startEditHymn(h)} className="bg-blue-600 text-white px-2 py-1 rounded">تعديل</button>
                    <button onClick={() => deleteHymn(h.id)} className="bg-red-700 text-white px-2 py-1 rounded">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}