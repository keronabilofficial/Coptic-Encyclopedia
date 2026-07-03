'use client';
import { useState, useEffect } from 'react';

const ADMIN_SECRET_PASSWORD = "Abo@Filumina@6101996";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [seasons, setSeasons] = useState([]);
  const [hymns, setHymns] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = {
    season_slug: '', title: '', liturgy_type: 'سنوي', ritual_notes: '',
    performance_style: '', text_coptic: '', text_arabic_coptic: '',
    text_arabic: '', audio_url: ''
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (sessionStorage.getItem('auth') === 'true') setIsAuthenticated(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const resS = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seasons`);
      const resH = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hymns`);
      setSeasons(await resS.json());
      setHymns(await resH.json());
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL}/api/hymns/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL}/api/hymns`;
    await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    alert("تم الحفظ!");
    setEditingId(null);
    setForm(initialForm);
    loadData();
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-[#5c0612]">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <input type="password" onChange={(e)=>setPasswordInput(e.target.value)} className="w-full border-2 p-3 rounded-lg mb-4 text-center" placeholder="كلمة المرور" />
        <button onClick={() => {if(passwordInput===ADMIN_SECRET_PASSWORD) {sessionStorage.setItem('auth','true'); setIsAuthenticated(true);}}} className="w-full bg-[#5c0612] text-white p-3 rounded-lg font-bold">دخول</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[#f7f4eb] min-h-screen" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-[#5c0612] border-b-2 border-[#d4af37] pb-4">لوحة التحكم - إضافة وتعديل الألحان</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border-2 border-[#d4af37] shadow-lg mb-10 space-y-4">
        <select className="w-full p-3 border-2 rounded-lg" onChange={(e) => setForm({...form, season_slug: e.target.value})}>
           <option>-- اختر الموسم --</option>
           {seasons.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
        </select>
        <input className="w-full p-3 border-2 rounded-lg" placeholder="اسم اللحن" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
        <input className="w-full p-3 border-2 rounded-lg" placeholder="عوائد الطقس والأداء" value={form.ritual_notes} onChange={(e) => setForm({...form, ritual_notes: e.target.value})} />
        <textarea className="w-full p-3 border-2 rounded-lg" placeholder="النص القبطي" value={form.text_coptic} onChange={(e) => setForm({...form, text_coptic: e.target.value})} />
        <textarea className="w-full p-3 border-2 rounded-lg" placeholder="النطق القبطي معرباً" value={form.text_arabic_coptic} onChange={(e) => setForm({...form, text_arabic_coptic: e.target.value})} />
        <textarea className="w-full p-3 border-2 rounded-lg" placeholder="الترجمة العربية" value={form.text_arabic} onChange={(e) => setForm({...form, text_arabic: e.target.value})} />
        <input className="w-full p-3 border-2 rounded-lg" placeholder="رابط الملف الصوتي" value={form.audio_url} onChange={(e) => setForm({...form, audio_url: e.target.value})} />
        
        <button type="submit" className="w-full bg-[#5c0612] text-[#f2cc8f] p-4 rounded-xl font-bold text-lg">{editingId ? 'حفظ التعديلات' : 'إضافة اللحن'}</button>
      </form>

      <table className="w-full bg-white border rounded-2xl">
        <thead><tr className="bg-[#5c0612] text-white"><th className="p-3">اسم اللحن</th><th className="p-3">تحكم</th></tr></thead>
        <tbody>
          {hymns.map(h => (
            <tr key={h.id} className="border-b hover:bg-gray-50">
              <td className="p-4 font-bold">{h.title}</td>
              <td className="p-4 space-x-2">
                <button onClick={() => {setEditingId(h.id); setForm(h); window.scrollTo({top:0, behavior:'smooth'})}} className="bg-blue-600 text-white px-4 py-2 rounded">تعديل</button>
                <button onClick={() => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hymns/${h.id}`, {method:'DELETE'}).then(loadData)} className="bg-red-600 text-white px-4 py-2 rounded">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}