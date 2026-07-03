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

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resS, resH] = await Promise.all([
        fetch(`${API_URL}/api/seasons`),
        fetch(`${API_URL}/api/hymns`)
      ]);
      if (!resS.ok || !resH.ok) throw new Error('فشل في جلب البيانات');
      const [seasonsData, hymnsData] = await Promise.all([resS.json(), resH.json()]);
      setSeasons(seasonsData);
      setHymns(hymnsData);
      setError(null);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) loadData(); }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // تنظيف شامل لكل الحقول قبل الإرسال لضمان اليونيكود
    const cleanForm = {
      ...form,
      title: convertLegacyToUnicodeCoptic(form.title),
      ritual_notes: convertLegacyToUnicodeCoptic(form.ritual_notes),
      performance_style: convertLegacyToUnicodeCoptic(form.performance_style),
      text_coptic: convertLegacyToUnicodeCoptic(form.text_coptic)
    };

    const url = editingId ? `${API_URL}/api/hymns/${editingId}` : `${API_URL}/api/hymns`;
    try {
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanForm)
      });
      if (!res.ok) throw new Error('حدث خطأ أثناء حفظ البيانات');
      alert("تم الحفظ بنجاح!");
      setEditingId(null);
      setForm(initialForm);
      loadData();
    } catch (err) { alert(err.message); }
  };

  const deleteHymn = async (id) => {
    if(!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`${API_URL}/api/hymns/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل الحذف');
      loadData();
    } catch (err) { alert(err.message); }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-[#5c0612]">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full mx-4">
        <h2 className="text-black font-bold text-xl mb-4">بوابة الإدارة الطقسية</h2>
        <input type="password" onChange={(e) => setPasswordInput(e.target.value)} className="w-full border-2 p-3 rounded-lg mb-4 text-center text-black outline-none" placeholder="كلمة المرور" />
        <button onClick={() => { if (passwordInput === ADMIN_SECRET_PASSWORD) { sessionStorage.setItem('auth', 'true'); setIsAuthenticated(true); } else { alert('خطأ!'); } }} className="w-full bg-[#5c0612] text-white p-3 rounded-lg font-bold">دخول</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[#f7f4eb] min-h-screen" dir="rtl">
      <h1 className="text-3xl font-bold text-[#5c0612] mb-8">لوحة تدوين الألحان</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border-2 border-[#d4af37] shadow-lg mb-10 space-y-4">
        <input className="w-full p-3 border-2 rounded-lg text-black" placeholder="اسم اللحن" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
        <textarea className="w-full p-3 border-2 rounded-lg text-black" rows={4} placeholder="النص القبطي" value={form.text_coptic} onChange={(e) => setForm({...form, text_coptic: e.target.value})} />
        <button type="submit" className="w-full bg-[#5c0612] text-[#f2cc8f] p-4 rounded-xl font-bold">{editingId ? 'حفظ التعديلات' : 'تأكيد الإضافة'}</button>
      </form>
      {/* جدول الألحان كما هو */}
    </div>
  );
}