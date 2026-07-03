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
    } catch (err) { console.error("خطأ تحميل البيانات:", err); }
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

  const deleteHymn = async (id) => {
    if(!id || !confirm("متأكد من الحذف؟")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hymns/${id}`, { method: 'DELETE' });
    loadData();
  };

  if (!isAuthenticated) return (
    <div className="p-10 text-center bg-[#240105] min-h-screen flex flex-col justify-center items-center">
      <input type="password" onChange={(e)=>setPasswordInput(e.target.value)} className="border p-2 rounded mb-2" placeholder="كلمة المرور" />
      <button onClick={() => {if(passwordInput===ADMIN_SECRET_PASSWORD) {sessionStorage.setItem('auth','true'); setIsAuthenticated(true);}}} className="bg-[#5c0612] text-[#f2cc8f] p-3 rounded">دخول</button>
    </div>
  );

  return (
    <div className="p-6 bg-[#f7f4eb] min-h-screen" dir="rtl">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border mb-6 space-y-3 shadow-sm">
        <h2 className="font-bold text-xl">{editingId ? 'تعديل لحن' : 'إضافة لحن'}</h2>
        <input placeholder="اسم اللحن" value={form.title} className="w-full p-2 border rounded" onChange={(e) => setForm({...form, title: e.target.value})} />
        <input placeholder="الأداء" value={form.performance_style} className="w-full p-2 border rounded" onChange={(e) => setForm({...form, performance_style: e.target.value})} />
        <button type="submit" className="bg-[#5c0612] text-white p-3 w-full rounded">{editingId ? 'حفظ التعديلات' : 'إضافة'}</button>
      </form>

      <table className="w-full bg-white border rounded-lg shadow-sm">
        <thead><tr className="bg-gray-200"><th className="p-2">اللحن</th><th className="p-2">تحكم</th></tr></thead>
        <tbody>
          {hymns.map(h => (
            <tr key={h.id || Math.random()} className="border-b">
              <td className="p-2">{h.title}</td>
              <td className="p-2 space-x-2">
                <button onClick={() => {setEditingId(h.id); setForm(h);}} className="bg-blue-600 text-white px-2 py-1 rounded">تعديل</button>
                <button onClick={() => deleteHymn(h.id)} className="bg-red-600 text-white px-2 py-1 rounded">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}