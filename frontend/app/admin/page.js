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

  // الحالة الأساسية (تأكد إن دي هي نفس الأسماء اللي السيرفر بيستقبلها)
  const initialForm = {
    season_slug: '',
    title: '',
    liturgy_type: 'سنوي',
    ritual_notes: '',
    text_coptic: '',
    text_arabic_coptic: '',
    text_arabic: '',
    audio_url: ''
  };

  const [hymnFormData, setHymnFormData] = useState(initialForm);

  // ... (باقي الدوال loadInitialData, handleLoginSubmit, etc) ...

  // الجزء المهم: دالة الحفظ
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
      
      setEditingHymnId(null);
      setHymnFormData(initialForm); // تصفير الفورم بعد الحفظ
      loadInitialData();
      alert("تم الحفظ!");
    } catch (err) { alert(err.message); } 
    finally { setIsHymnSubmitting(false); }
  };

  // ... باقي الواجهة (Return) ...
}