'use client';
import { useState, useEffect } from 'react';
import { convertLegacyToUnicodeCoptic } from '@/utils/copticConverter';

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
    // جلب الألحان من الباكيند
    fetch(`${API_URL}/api/hymns`)
      .then((res) => {
        if (!res.ok) throw new Error('فشل في جلب البيانات من السيرفر');
        return res.json();
      })
      .then((data) => {
        // === هنا بنستخدم الدالة اللي فوق عشان تقرأ وتنظف النص ===
        const cleanedData = data.map(hymn => ({
          ...hymn,
          title: convertLegacyToUnicodeCoptic(hymn.title),
          context: convertLegacyToUnicodeCoptic(hymn.context || hymn.description),
          lyrics: convertLegacyToUnicodeCoptic(hymn.lyrics)
        }));

        setHymns(cleanedData);
        setFilteredHymns(cleanedData);
        // ======================================================

        const dbSeasons = cleanedData.map(hymn => hymn.liturgy_type || hymn.season).filter(Boolean);
        const uniqueSeasons = ['الكل', ...new Set(dbSeasons)];
        
        setSeasonsList(uniqueSeasons);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching hymns:", err);
        setError(err.message);
        setLoading(false);
      });
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
    alert("تم الحفظ بنجاح!");
    setEditingId(null);
    setForm(initialForm);
    loadData();
  };

  const deleteHymn = async (id) => {
    if(!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hymns/${id}`, { method: 'DELETE' });
    loadData();
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-[#5c0612]">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <input type="password" onChange={(e)=>setPasswordInput(e.target.value)} className="w-full border-2 p-3 rounded-lg mb-4 text-center text-black" placeholder="كلمة المرور" />
        <button onClick={() => {if(passwordInput===ADMIN_SECRET_PASSWORD) {sessionStorage.setItem('auth','true'); setIsAuthenticated(true);}}} className="w-full bg-[#5c0612] text-white p-3 rounded-lg font-bold">دخول</button>
      </div>
    </div>
  );

  const inputStyle = "w-full p-3 border-2 border-gray-400 rounded-lg text-black bg-white focus:border-red-900 outline-none";

  return (
    <div className="p-6 bg-[#f7f4eb] min-h-screen" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-[#5c0612] border-b-2 border-[#d4af37] pb-4">لوحة تدوين الألحان</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border-2 border-[#d4af37] shadow-lg mb-10 space-y-4">
        <h2 className="font-bold text-xl text-[#5c0612]">{editingId ? 'تعديل لحن' : 'إضافة لحن جديد'}</h2>
        <select className={inputStyle} onChange={(e) => setForm({...form, season_slug: e.target.value})} value={form.season_slug}>
           <option value="">-- اختر الموسم --</option>
           {seasons.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
        </select>
        <input className={inputStyle} placeholder="اسم اللحن" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
        <input className={inputStyle} placeholder="عوائد الطقس" value={form.ritual_notes} onChange={(e) => setForm({...form, ritual_notes: e.target.value})} />
        <input className={inputStyle} placeholder="الأداء" value={form.performance_style} onChange={(e) => setForm({...form, performance_style: e.target.value})} />
        <textarea className={inputStyle} placeholder="النص القبطي" value={form.text_coptic} onChange={(e) => setForm({...form, text_coptic: e.target.value})} />
        <textarea className={inputStyle} placeholder="النطق القبطي معرباً" value={form.text_arabic_coptic} onChange={(e) => setForm({...form, text_arabic_coptic: e.target.value})} />
        <textarea className={inputStyle} placeholder="الترجمة العربية" value={form.text_arabic} onChange={(e) => setForm({...form, text_arabic: e.target.value})} />
        <input className={inputStyle} placeholder="رابط الملف الصوتي" value={form.audio_url} onChange={(e) => setForm({...form, audio_url: e.target.value})} />
        <button type="submit" className="w-full bg-[#5c0612] text-[#f2cc8f] p-4 rounded-xl font-bold text-lg">{editingId ? 'حفظ التعديلات' : 'إضافة اللحن'}</button>
      </form>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <table className="w-full text-right border-collapse">
          <thead><tr className="bg-[#5c0612] text-white"><th className="p-3">اسم اللحن</th><th className="p-3">تحكم</th></tr></thead>
          <tbody>
            {hymns.map(h => (
              <tr key={h.id} className="border-b-2 border-gray-100">
                <td className="p-4 font-bold text-black">{h.title}</td>
                <td className="p-4 space-x-2">
                  <button onClick={() => {setEditingId(h.id); setForm(h); window.scrollTo({top:0, behavior:'smooth'})}} className="bg-blue-700 text-white px-4 py-2 rounded-lg">تعديل</button>
                  <button onClick={() => deleteHymn(h.id)} className="bg-red-700 text-white px-4 py-2 rounded-lg">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}