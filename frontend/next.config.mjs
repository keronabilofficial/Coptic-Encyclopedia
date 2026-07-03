import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // معطل في البيئة التجريبية لتسريع التصفح ويشتغل أوتوماتيك في الـ Production
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {}, // السطر ده مهم جداً في Next 16 لإسكات الخطأ والسماح للمكتبة بالعمل مع الـ Webpack
};

export default withPWA(nextConfig);