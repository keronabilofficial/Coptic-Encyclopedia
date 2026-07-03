'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [hymns, setHymns] = useState([]);
  const [form, setForm] = useState({ 
    season_slug: '', title: '', ritual_notes: '', performance_style: '', 
    text_coptic: '', text_arabic_coptic: '', text_arabic: '', audio_url: '' 
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hymns`);
      setHymns(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hymns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    alert("تم الحفظ!");
    loadData();
  };

  return (
    <div className="p-6 bg-[#f7f4eb] min-h-screen" dir="rtl">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="font-bold text-xl">إضافة لحن جديد</h2>
        <input className="w-full p-2 border" placeholder="اسم اللحن" onChange={(e) => setForm({...form, title: e.target.value})} />
        <input className="w-full p-2 border" placeholder="عوائد الطقس" onChange={(e) => setForm({...form, ritual_notes: e.target.value})} />
        <input className="w-full p-2 border" placeholder="الأداء" onChange={(e) => setForm({...form, performance_style: e.target.value})} />
        <textarea className="w-full p-2 border" placeholder="النص القبطي" onChange={(e) => setForm({...form, text_coptic: e.target.value})} />
        <textarea className="w-full p-2 border" placeholder="النطق القبطي معرباً" onChange={(e) => setForm({...form, text_arabic_coptic: e.target.value})} />
        <textarea className="w-full p-2 border" placeholder="الترجمة العربية" onChange={(e) => setForm({...form, text_arabic: e.target.value})} />
        <input className="w-full p-2 border" placeholder="رابط الصوت" onChange={(e) => setForm({...form, audio_url: e.target.value})} />
        <button type="submit" className="bg-red-900 text-white p-3 w-full rounded">حفظ اللحن</button>
      </form>

      <div className="mt-6">
        {hymns.map(h => (
          <div key={h.id} className="bg-white p-4 border-b flex justify-between">
            <span>{h.title}</span>
            <button onClick={() => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hymns/${h.id}`, {method:'DELETE'}).then(loadData)} className="bg-red-600 text-white px-2 py-1 rounded">حذف</button>
          </div>
        ))}
      </div>
    </div>
  );
}