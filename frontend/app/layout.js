import "./globals.css";

export const metadata = {
  title: 'الموسوعة الطقسية للألحان',
  description: 'موسوعة المخطوطات والألحان الكنسية الشريفة',
  manifest: '/manifest.json',
  icons: {
    apple: 'https://cdn-icons-png.flaticon.com/512/2914/2914108.png',
  }
};

export default function RootLayout({ children }) {
  return (
    // إضافة dir="rtl" عشان الموقع عربي
    <html lang="ar" dir="rtl">
      <body className="min-h-screen antialiased flex flex-col">
        
        {/* الهيدر (Header) الفخم اللي هيظهر في كل الصفحات */}
        <header className="glass-panel sticky top-0 z-50 coptic-border-top px-6 py-5 mb-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl coptic-title tracking-wide">
                الموسوعة الطقسية للألحان
              </h1>
              <span className="text-sm text-gray-400 mt-1" style={{ color: '#D4AF37', opacity: 0.7 }}>
                تراث المخطوطات والألحان الكنسية
              </span>
            </div>
          </div>
        </header>

        {/* المحتوى الرئيسي للموقع */}
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 w-full">
          {children}
        </main>

        {/* الفوتر (Footer) الختامي */}
        <footer className="mt-12 py-6 border-t border-gray-800/50 text-center">
          <p className="text-sm" style={{ color: 'rgba(212, 175, 55, 0.5)' }}>
          </p>
        </footer>

      </body>
    </html>
  );
}