"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ──────────────────────────────────────────────
// 메뉴 데이터 타입
// ──────────────────────────────────────────────
interface MenuItem {
  id: number;
  category: "디저트" | "음료" | "티";
  name: string;
  image: string; // 이미지 경로 (빈 문자열이면 플레이스홀더)
  price: number;
  quantity: number;
}

// ──────────────────────────────────────────────
// 초기 메뉴 데이터
// ──────────────────────────────────────────────
const initialMenuData: MenuItem[] = [
  // 디저트 메뉴
  { id: 1, category: "디저트", name: "시그니처 치즈박스", image: "/menu/signature-cheesebox.png", price: 4500, quantity: 0 },
  { id: 2, category: "디저트", name: "블루베리 치즈박스", image: "/menu/blueberry-cheesebox.png", price: 5000, quantity: 0 },
  { id: 3, category: "디저트", name: "플레인 휘낭시에", image: "/menu/plain-financier.png", price: 2900, quantity: 0 },
  { id: 4, category: "디저트", name: "무화과 크림치즈 휘낭시에", image: "/menu/fig-cream-financier.png", price: 3500, quantity: 0 },
  { id: 5, category: "디저트", name: "소금초코 휘낭시에", image: "/menu/salt-choco-financier.png", price: 3500, quantity: 0 },
  { id: 6, category: "디저트", name: "아몬드 휘낭시에", image: "/menu/almond-financier.png", price: 3300, quantity: 0 },
  { id: 7, category: "디저트", name: "얼그레이 화이트 마들렌", image: "/menu/earlgrey-madeleine.png", price: 3500, quantity: 0 },
  { id: 8, category: "디저트", name: "피칸 에스프레소 마들렌", image: "/menu/pecan-espresso-madeleine.png", price: 3500, quantity: 0 },
  { id: 9, category: "디저트", name: "플레인 마들렌", image: "/menu/plain-madeleine.png", price: 2900, quantity: 0 },
  { id: 10, category: "디저트", name: "월넛 초코 르뱅쿠키", image: "/menu/walnut-choco-levain.png", price: 4500, quantity: 0 },
  { id: 11, category: "디저트", name: "말차 마카다미아 르뱅쿠키", image: "/menu/matcha-macadamia-levain.png", price: 5000, quantity: 0 },
  { id: 12, category: "디저트", name: "아몬드 청키초코 르뱅쿠키", image: "/menu/almond-chunky-levain.png", price: 5000, quantity: 0 },
  { id: 13, category: "디저트", name: "두바이 쫀득쿠키", image: "/menu/dubai-cookie.png", price: 5500, quantity: 0 },
  // 음료 메뉴
  { id: 14, category: "음료", name: "아메리카노", image: "", price: 3800, quantity: 0 },
  { id: 15, category: "음료", name: "카페라떼", image: "", price: 4000, quantity: 0 },
  { id: 16, category: "음료", name: "무설탕 초코라떼", image: "", price: 5000, quantity: 0 },
  { id: 17, category: "음료", name: "말차라떼", image: "", price: 5000, quantity: 0 },
  { id: 18, category: "음료", name: "아이스티", image: "", price: 4500, quantity: 0 },
  // 티 메뉴
  { id: 19, category: "티", name: "페퍼민트", image: "", price: 5000, quantity: 0 },
  { id: 20, category: "티", name: "캐모마일", image: "", price: 5000, quantity: 0 },
];

// ──────────────────────────────────────────────
// 카테고리 설정
// ──────────────────────────────────────────────
const categories = ["디저트", "음료", "티"] as const;
const categoryEmoji: Record<string, string> = {
  "디저트": "🍰",
  "음료": "☕",
  "티": "🍵",
};

// ──────────────────────────────────────────────
// 유틸 함수
// ──────────────────────────────────────────────

// 원화 형식 변환 (예: 4500 → "4,500")
function formatWon(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return safe.toLocaleString("ko-KR");
}

// 안전한 정수 파싱 (음수, NaN 방지)
function safeParseInt(value: string): number {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return parsed;
}

// 안전한 금액 파싱
function safeParsePrice(value: string): number {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return parsed;
}

// ──────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────
export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuData);
  const [activePage, setActivePage] = useState(0);
  // 금액 편집 중인 메뉴 id (null이면 편집 안 함)
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── 핸들러 ──

  const handleQuantityStep = (id: number, delta: number) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = item.quantity + delta;
        return { ...item, quantity: next < 0 ? 0 : next };
      })
    );
  };

  const handleQuantityChange = (id: number, value: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: safeParseInt(value) } : item
      )
    );
  };

  const handlePriceChange = (id: number, value: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, price: safeParsePrice(value) } : item
      )
    );
  };

  const handleReset = () => {
    setMenuItems(initialMenuData.map((item) => ({ ...item, quantity: 0 })));
  };

  // ── 스와이프 페이지 감지 ──

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const page = Math.round(scrollLeft / clientWidth);
    if (page !== activePage && page >= 0 && page < categories.length) {
      setActivePage(page);
    }
  }, [activePage]);

  // 탭 클릭 시 해당 페이지로 스크롤
  const scrollToPage = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * scrollRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  // 윈도우 리사이즈 시 현재 페이지 위치 보정
  useEffect(() => {
    const handleResize = () => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollTo({
        left: activePage * scrollRef.current.clientWidth,
        behavior: "instant",
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activePage]);

  // ── 계산 ──

  const grandTotal = menuItems.reduce((sum, item) => {
    const sub = (item.price || 0) * (item.quantity || 0);
    return sum + (Number.isFinite(sub) ? sub : 0);
  }, 0);

  const totalQuantity = menuItems.reduce((s, i) => s + (i.quantity || 0), 0);
  const totalMenuCount = menuItems.filter((i) => i.quantity > 0).length;

  // 카테고리별 소계 계산
  const categoryTotals = categories.map((cat) =>
    menuItems
      .filter((i) => i.category === cat)
      .reduce((sum, i) => {
        const sub = (i.price || 0) * (i.quantity || 0);
        return sum + (Number.isFinite(sub) ? sub : 0);
      }, 0)
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ── 헤더 ── */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-900">☕ 카페 메뉴 정산</h1>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg active:bg-red-100"
        >
          초기화
        </button>
      </header>

      {/* ── 탭 네비게이션 ── */}
      <nav className="flex-shrink-0 bg-white border-b border-gray-200 flex">
        {categories.map((cat, idx) => (
          <button
            key={cat}
            onClick={() => scrollToPage(idx)}
            className={`flex-1 py-2.5 text-center transition-colors relative ${
              activePage === idx
                ? "text-amber-600 font-bold"
                : "text-gray-500 font-medium"
            }`}
          >
            <span className="text-sm">
              {categoryEmoji[cat]} {cat}
            </span>
            {/* 카테고리 소계 */}
            {categoryTotals[idx] > 0 && (
              <span className="block text-[10px] text-amber-500 font-semibold">
                {formatWon(categoryTotals[idx])}원
              </span>
            )}
            {/* 활성 탭 인디케이터 */}
            {activePage === idx && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* ── 스와이프 컨테이너 ── */}
      <main
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto overflow-y-hidden swipe-container"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {categories.map((category, pageIdx) => {
          const items = menuItems.filter((i) => i.category === category);

          return (
            <section
              key={category}
              className="min-w-full w-full overflow-y-auto px-2 py-2"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* 메뉴 리스트 */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {items.map((item, idx) => {
                  const itemTotal = (item.price || 0) * (item.quantity || 0);
                  const safeTotal = Number.isFinite(itemTotal) ? itemTotal : 0;
                  const isActive = item.quantity > 0;
                  const isEditing = editingPriceId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center px-2 py-[5px] gap-1.5 ${
                        idx < items.length - 1 ? "border-b border-gray-100" : ""
                      } ${isActive ? "bg-amber-50/60" : ""}`}
                    >
                      {/* 이미지 (원본 비율 유지, 작게 표시) */}
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded object-contain flex-shrink-0"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs">
                          {category === "디저트" ? "🍰" : category === "음료" ? "☕" : "🍵"}
                        </span>
                      )}
                      {/* 메뉴명 + 가격 (한 줄) */}
                      <div className="flex-1 min-w-0"
                        onClick={() => setEditingPriceId(editingPriceId === item.id ? null : item.id)}
                      >
                        {isEditing ? (
                          <>
                            <p className="text-[12px] font-medium text-gray-700 truncate leading-tight">{item.name}</p>
                            <input
                              type="number" min="0" autoFocus
                              value={item.price}
                              onChange={(e) => handlePriceChange(item.id, e.target.value)}
                              onBlur={() => setEditingPriceId(null)}
                              onKeyDown={(e) => { if (e.key === "Enter") setEditingPriceId(null); }}
                              className="w-16 text-[10px] text-gray-500 border border-amber-300 rounded px-1 focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </>
                        ) : (
                          <p className={`text-[12px] leading-tight truncate ${
                            isActive ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                          }`}>
                            {item.name} <span className="text-[10px] text-gray-400 font-normal">{formatWon(item.price)}</span>
                          </p>
                        )}
                      </div>
                      {/* 수량 */}
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => handleQuantityStep(item.id, -1)}
                          className="w-[22px] h-[22px] flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs font-bold active:bg-gray-200"
                        >-</button>
                        <span className="w-5 text-center text-[12px] font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityStep(item.id, 1)}
                          className="w-[22px] h-[22px] flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold active:bg-amber-600"
                        >+</button>
                      </div>
                      {/* 합계 */}
                      <span className={`w-12 text-right text-[11px] font-bold flex-shrink-0 ${
                        safeTotal > 0 ? "text-amber-600" : "text-gray-200"
                      }`}>
                        {safeTotal > 0 ? formatWon(safeTotal) : "-"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 카테고리 소계 */}
              {categoryTotals[pageIdx] > 0 && (
                <div className="mt-2 px-3 py-2 bg-amber-50 rounded-lg flex justify-between items-center">
                  <span className="text-xs text-amber-700 font-medium">{category} 소계</span>
                  <span className="text-sm font-bold text-amber-600">
                    {formatWon(categoryTotals[pageIdx])}원
                  </span>
                </div>
              )}
            </section>
          );
        })}
      </main>

      {/* ── 하단 전체 총합 (고정) ── */}
      <footer className="flex-shrink-0 bg-white border-t-2 border-amber-400 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">전체 총합</p>
          <p className="text-[10px] text-gray-400">
            {totalMenuCount}종 / {totalQuantity}개
          </p>
        </div>
        <p className={`text-xl font-extrabold ${
          grandTotal > 0 ? "text-amber-600" : "text-gray-300"
        }`}>
          {formatWon(grandTotal)}원
        </p>
      </footer>
    </div>
  );
}
