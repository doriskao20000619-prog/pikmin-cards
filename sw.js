const CACHE_NAME = 'pikmin-share-cache-v1';
const SHARED_IMAGE_PATH = '/_shared_image';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 攔截網路請求
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 攔截 Share Target 的 POST 請求
  if (event.request.method === 'POST' && url.pathname === '/_share-target') {
    event.respondWith((async () => {
      try {
        // 取得分享過來的表單資料
        const formData = await event.request.formData();
        const imageFile = formData.get('shared_image');

        if (imageFile) {
          // 將圖片存入 Cache 中繼站
          const cache = await caches.open(CACHE_NAME);
          await cache.put(SHARED_IMAGE_PATH, new Response(imageFile));
        }

        // 處理完畢後，重新導向回首頁，並加上參數通知前端
        return Response.redirect('/?shared=true', 303);
        
      } catch (error) {
        console.error('處理分享圖片時發生錯誤:', error);
        return Response.redirect('/?shared_error=true', 303);
      }
    })());
  }
});