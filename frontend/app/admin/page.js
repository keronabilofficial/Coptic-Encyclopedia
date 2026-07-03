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
  const [isHymnSubmitting, setIsHymnSubmitting] = useState(false);

  const initialForm = {
    season_slug: '',
    title: '',
    liturgy_type: 'سنوي',
    ritual_notes: '',
    performance_style: '',
    text_coptic: '',
    text_arabic_coptic: '',
    text_arabic: '',
    audio_url: ''
  };

  const [hymnFormData, setHymnFormData] = useState(initialForm);

  useEffect(() => {
    if (sessionStorage.getItem('hymns_admin_authenticated') === 'true') setIsAuthenticated(true);
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const resSeasons = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seasons`);
      const dataSeasons = await resSeasons.json();
      setSeasons(dataSeasons);
      const resHymns = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hymns`);
      const dataHymns = await resHymns.json();
      setHymns(dataHymns);
    } catch (err) { console.error(err); }
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
      if (!res.ok) throw new Error("فشل الحفظ");
      alert("تم الحفظ بنجاح!");
      setEditingHymnId(null);
      setHymnFormData(initialForm);
      loadInitialData();
    } catch (err) { alert(err.message); } 
    finally { setIsHymnSubmitting(false); }
  };

  const startEditHymn = (hymn) => {
    setEditingHymnId(hymn.id);
    setHymnFormData(hymn);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const deleteHymn = async (id) => {
    if (!confirm('هل أنت متأكد؟')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hymns/${id}`, { method: 'DELETE' });
    loadInitialData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#240105] flex items-center justify-center px-4" dir="rtl">
        <div className="bg-[#f7f4eb] border-2 border-[#d4af37] rounded-2xl p-8 max-w-md w-full text-center">
          <form onSubmit={(e) => { e.preventDefault(); if(passwordInput === ADMIN_SECRET_PASSWORD) { sessionStorage.setItem('hymns_admin_authenticated', 'true'); setIsAuthenticated(true); } else setAuthError('كلمة المرور خطأ'); }} className="space-y-4">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full text-center rounded-xl px-4 py-3 border" placeholder="كلمة المرور" />
            <button type="submit" className="w-full bg-[#5c0612] text-[#f2cc8f] py-3 rounded-xl">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4eb] p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">لوحة تدوين الألحان</h1>
      <form onSubmit={handleHymnSubmit} className="grid gap-4 bg-white p-6 rounded-lg border shadow-sm">
        <select value={hymnFormData.season_slug} onChange={(e) => setHymnFormData({...hymnFormData, season_slug: e.target.value})} className="border p-2 rounded-xl">
           <option value="">-- اختر الموسم --</option>
           {seasons.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
        </select>
        <input placeholder="اسم اللحن" value={hymnFormData.title} onChange={(e) => setHymnFormData({...hymnFormData, title: e.target.value})} className="border p-2 rounded-xl" />
        <input placeholder="عوائد الطقس" value={hymnFormData.ritual_notes} onChange={(e) => setHymnFormData({...hymnFormData, ritual_notes: e.target.value})} className="border p-2 rounded-xl" />
        <input placeholder="الأداء" value={hymnFormData.performance_style} onChange={(e) => setHymnFormData({...hymnFormData, performance_style: e.target.value})} className="border p-2 rounded-xl" />
        <textarea placeholder="النطق القبطي معرباً" value={hymnFormData.text_arabic_coptic} onChange={(e) => setHymnFormData({...hymnFormData, text_arabic_coptic: e.target.value})} className="border p-2 rounded-xl" />
        <input placeholder="رابط الملف الصوتي" value={hymnFormData.audio_url} onChange={(e) => setHymnFormData({...hymnFormData, audio_url: e.target.value})} className="border p-2 rounded-xl" />
        <textarea placeholder="النص القبطي" value={hymnFormData.text_coptic} onChange={(e) => setHymnFormData({...hymnFormData, text_coptic: e.target.value})} className="border p-2 rounded-xl" />
        <textarea placeholder="الترجمة العربية" value={hymnFormData.text_arabic} onChange={(e) => setHymnFormData({...hymnFormData, text_arabic: e.target.value})} className="border p-2 rounded-xl" />
        <button type="submit" className="bg-amber-800 text-white py-3 rounded-xl">{isHymnSubmitting ? 'جاري...' : 'حفظ'}</button>
      </form>
    </div>
  );
}