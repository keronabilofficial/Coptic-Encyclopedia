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

  // تنسيق ثابت للحقول لضمان اللون الأسود
  const inputStyle = "w-full p-3 border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 focus:border-red-900 outline-none";

  return (
    <div className="p-6 bg-[#f7f4eb] min-h-screen" dir="rtl">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="font-bold text-xl text-black">إضافة لحن جديد</h2>
        <input className={inputStyle} placeholder="اسم اللحن" onChange={(e) => setForm({...form, title: e.target.value})} />
        <input className={inputStyle} placeholder="عوائد الطقس" onChange={(e) => setForm({...form, ritual_notes: e.target.value})} />
        <input className={inputStyle} placeholder="الأداء" onChange={(e) => setForm({...form, performance_style: e.target.value})} />
        <textarea className={inputStyle} placeholder="النص القبطي" onChange={(e) => setForm({...form, text_coptic: e.target.value})} />
        <textarea className={inputStyle} placeholder="النطق القبطي معرباً" onChange={(e) => setForm({...form, text_arabic_coptic: e.target.value})} />
        <textarea className={inputStyle} placeholder="الترجمة العربية" onChange={(e) => setForm({...form, text_arabic: e.target.value})} />
        <input className={inputStyle} placeholder="رابط الصوت" onChange={(e) => setForm({...form, audio_url: e.target.value})} />
        <button type="submit" className="bg-red-900 text-white p-3 w-full rounded font-bold">حفظ اللحن</button>
      </form>
    </div>
  );
}