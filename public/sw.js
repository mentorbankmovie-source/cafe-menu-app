const CACHE_NAME = "cafe-menu-v1";
const PRECACHE_URLS = ["/", "/manifest.json"];

// 설치: 앱 셸 프리캐시
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// 활성화: 이전 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// 요청 가로채기: 네트워크 우선, 실패 시 캐시
self.addEventListener("fetch", (event) => {
  // POST 요청 등은 무시
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 정상 응답이면 캐시에 저장
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // 오프라인: 캐시에서 응답
        return caches.match(event.request);
      })
  );
});
