"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ──────────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────────
interface MenuItem {
  id: number;
  category: "디저트" | "음료";
  name: string;
  image: string;
  price: number;
  // 음료: Hot/Ice 각각 수량 관리, 디저트: hot만 사용
  hotQty: number;
  iceQty: number;
  hasTempOption: boolean; // Hot/Ice 선택 가능 여부 (음료만 true)
}

// 주문 내역 항목
interface OrderItem {
  name: string;
  temp: string; // "Hot" | "Ice" | "" (디저트)
  qty: number;
  price: number;
  subtotal: number;
}

// 주문 내역
interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  time: string; // 주문 시각
}

// ──────────────────────────────────────────────
// 초기 메뉴 데이터
// ──────────────────────────────────────────────
const initialMenuData: MenuItem[] = [
  // 디저트 (Hot/Ice 구분 없음)
  { id: 1, category: "디저트", name: "시그니처 치즈박스", image: "/menu/signature-cheesebox.png", price: 4500, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 2, category: "디저트", name: "블루베리 치즈박스", image: "/menu/blueberry-cheesebox.png", price: 5000, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 3, category: "디저트", name: "플레인 휘낭시에", image: "/menu/plain-financier.png", price: 2900, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 4, category: "디저트", name: "무화과 크림치즈 휘낭시에", image: "/menu/fig-cream-financier.png", price: 3500, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 5, category: "디저트", name: "소금초코 휘낭시에", image: "/menu/salt-choco-financier.png", price: 3500, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 6, category: "디저트", name: "아몬드 휘낭시에", image: "/menu/almond-financier.png", price: 3300, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 7, category: "디저트", name: "얼그레이 화이트 마들렌", image: "/menu/earlgrey-madeleine.png", price: 3500, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 8, category: "디저트", name: "피칸 에스프레소 마들렌", image: "/menu/pecan-espresso-madeleine.png", price: 3500, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 9, category: "디저트", name: "플레인 마들렌", image: "/menu/plain-madeleine.png", price: 2900, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 10, category: "디저트", name: "월넛 초코 르뱅쿠키", image: "/menu/walnut-choco-levain.png", price: 4500, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 11, category: "디저트", name: "말차 마카다미아 르뱅쿠키", image: "/menu/matcha-macadamia-levain.png", price: 5000, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 12, category: "디저트", name: "아몬드 청키초코 르뱅쿠키", image: "/menu/almond-chunky-levain.png", price: 5000, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 13, category: "디저트", name: "두바이 쫀득쿠키", image: "/menu/dubai-cookie.png", price: 5500, hotQty: 0, iceQty: 0, hasTempOption: false },
  // 음료 (Hot/Ice 선택 가능)
  { id: 14, category: "음료", name: "아메리카노", image: "", price: 3800, hotQty: 0, iceQty: 0, hasTempOption: true },
  { id: 15, category: "음료", name: "카페라떼", image: "", price: 4500, hotQty: 0, iceQty: 0, hasTempOption: true },
  { id: 16, category: "음료", name: "무설탕 초코라떼", image: "", price: 5000, hotQty: 0, iceQty: 0, hasTempOption: true },
  { id: 17, category: "음료", name: "말차라떼", image: "", price: 5000, hotQty: 0, iceQty: 0, hasTempOption: true },
  { id: 18, category: "음료", name: "복숭아 아이스티", image: "", price: 4000, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 19, category: "음료", name: "매실 아이스티", image: "", price: 4000, hotQty: 0, iceQty: 0, hasTempOption: false },
  { id: 20, category: "음료", name: "페퍼민트", image: "", price: 4000, hotQty: 0, iceQty: 0, hasTempOption: true },
  { id: 21, category: "음료", name: "캐모마일", image: "", price: 4000, hotQty: 0, iceQty: 0, hasTempOption: true },
];

// ──────────────────────────────────────────────
// 카테고리 / 탭 설정
// ──────────────────────────────────────────────
const menuCategories = ["디저트", "음료"] as const;
const allTabs = ["디저트", "음료", "주문내역"] as const;
const tabEmoji: Record<string, string> = { "디저트": "🍰", "음료": "☕", "주문내역": "📋" };

// ──────────────────────────────────────────────
// 유틸
// ──────────────────────────────────────────────
function formatWon(n: number): string {
  return (Number.isFinite(n) ? n : 0).toLocaleString("ko-KR");
}
function safeInt(v: string): number {
  const p = parseInt(v, 10);
  return Number.isNaN(p) || p < 0 ? 0 : p;
}

// ──────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────
export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuData);
  const [activePage, setActivePage] = useState(0);
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [nextOrderId, setNextOrderId] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── 수량 핸들러 ──

  const stepQty = (id: number, temp: "hot" | "ice", delta: number) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (temp === "hot") {
          const next = item.hotQty + delta;
          return { ...item, hotQty: next < 0 ? 0 : next };
        } else {
          const next = item.iceQty + delta;
          return { ...item, iceQty: next < 0 ? 0 : next };
        }
      })
    );
  };

  const handlePriceChange = (id: number, value: string) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: safeInt(value) } : item))
    );
  };

  // ── 주문 완료 ──

  const handleOrderComplete = () => {
    const orderItems: OrderItem[] = [];
    menuItems.forEach((item) => {
      const totalQty = item.hotQty + item.iceQty;
      if (totalQty === 0) return;

      if (item.hasTempOption) {
        // Hot/Ice 각각 별도 항목
        if (item.hotQty > 0) {
          orderItems.push({ name: item.name, temp: "Hot", qty: item.hotQty, price: item.price, subtotal: item.price * item.hotQty });
        }
        if (item.iceQty > 0) {
          orderItems.push({ name: item.name, temp: "Ice", qty: item.iceQty, price: item.price, subtotal: item.price * item.iceQty });
        }
      } else {
        // 디저트 또는 온도 구분 없는 음료
        orderItems.push({ name: item.name, temp: "", qty: item.hotQty, price: item.price, subtotal: item.price * item.hotQty });
      }
    });

    if (orderItems.length === 0) return;

    const total = orderItems.reduce((s, i) => s + i.subtotal, 0);
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    setOrders((prev) => [...prev, { id: nextOrderId, items: orderItems, total, time }]);
    setNextOrderId((prev) => prev + 1);

    // 수량 초기화
    setMenuItems((prev) => prev.map((item) => ({ ...item, hotQty: 0, iceQty: 0 })));
  };

  // ── 주문 삭제 (서빙 완료) ──

  const deleteOrder = (orderId: number) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // ── 스와이프 ──

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const page = Math.round(scrollLeft / clientWidth);
    if (page !== activePage && page >= 0 && page < allTabs.length) {
      setActivePage(page);
    }
  }, [activePage]);

  const scrollToPage = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: index * scrollRef.current.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const handleResize = () => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollTo({ left: activePage * scrollRef.current.clientWidth, behavior: "instant" });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activePage]);

  // ── 계산 ──

  const grandTotal = menuItems.reduce((sum, item) => {
    return sum + item.price * (item.hotQty + item.iceQty);
  }, 0);

  const totalQuantity = menuItems.reduce((s, i) => s + i.hotQty + i.iceQty, 0);

  const selectedItems = menuItems.filter((i) => i.hotQty + i.iceQty > 0);

  const categoryTotals = menuCategories.map((cat) =>
    menuItems
      .filter((i) => i.category === cat)
      .reduce((sum, i) => sum + i.price * (i.hotQty + i.iceQty), 0)
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ── 헤더 ── */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-900">☕ 카페 메뉴 정산</h1>
        <button
          onClick={handleOrderComplete}
          disabled={totalQuantity === 0}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            totalQuantity > 0
              ? "bg-amber-500 text-white active:bg-amber-600"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          주문완료 {totalQuantity > 0 && `(${totalQuantity})`}
        </button>
      </header>

      {/* ── 탭 네비게이션 (3개) ── */}
      <nav className="flex-shrink-0 bg-white border-b border-gray-200 flex">
        {allTabs.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => scrollToPage(idx)}
            className={`flex-1 py-2 text-center transition-colors relative ${
              activePage === idx ? "text-amber-600 font-bold" : "text-gray-500 font-medium"
            }`}
          >
            <span className="text-sm">{tabEmoji[tab]} {tab}</span>
            {/* 카테고리 소계 (디저트/음료만) */}
            {idx < 2 && categoryTotals[idx] > 0 && (
              <span className="block text-[10px] text-amber-500 font-semibold">{formatWon(categoryTotals[idx])}원</span>
            )}
            {/* 주문내역 건수 */}
            {idx === 2 && orders.length > 0 && (
              <span className="block text-[10px] text-amber-500 font-semibold">{orders.length}건</span>
            )}
            {activePage === idx && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500 rounded-full" />}
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
        {/* ── 디저트 / 음료 페이지 ── */}
        {menuCategories.map((category, pageIdx) => {
          const items = menuItems.filter((i) => i.category === category);
          return (
            <section key={category} className="min-w-full w-full overflow-y-auto px-2 py-2" style={{ scrollSnapAlign: "start" }}>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {items.map((item, idx) => {
                  const totalQty = item.hotQty + item.iceQty;
                  const safeTotal = item.price * totalQty;
                  const isActive = totalQty > 0;
                  const isEditing = editingPriceId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`px-2.5 py-[5px] ${idx < items.length - 1 ? "border-b border-gray-100" : ""} ${isActive ? "bg-amber-50/60" : ""}`}
                    >
                      {/* 1줄: 이미지 + 이름 + 합계 */}
                      <div className="flex items-center gap-2">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-9 h-9 rounded object-contain flex-shrink-0" />
                        ) : (
                          <span className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm">{tabEmoji[category]}</span>
                        )}
                        <div className="flex-1 min-w-0" onClick={() => setEditingPriceId(editingPriceId === item.id ? null : item.id)}>
                          {isEditing ? (
                            <>
                              <p className="text-[13px] font-medium text-gray-700 truncate">{item.name}</p>
                              <input type="number" min="0" autoFocus value={item.price}
                                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                onBlur={() => setEditingPriceId(null)}
                                onKeyDown={(e) => { if (e.key === "Enter") setEditingPriceId(null); }}
                                className="w-16 text-[11px] text-gray-500 border border-amber-300 rounded px-1 mt-0.5 focus:outline-none"
                                onClick={(e) => e.stopPropagation()} />
                            </>
                          ) : (
                            <p className={`text-[13px] leading-snug truncate ${isActive ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                              {item.name} <span className="text-[11px] text-gray-400 font-normal">{formatWon(item.price)}</span>
                            </p>
                          )}
                        </div>
                        <span className={`w-14 text-right text-[12px] font-bold flex-shrink-0 ${safeTotal > 0 ? "text-amber-600" : "text-gray-200"}`}>
                          {safeTotal > 0 ? formatWon(safeTotal) : "-"}
                        </span>
                      </div>

                      {/* 2줄: Hot/Ice 수량 버튼 */}
                      <div className="flex items-center gap-2 mt-1 pl-11">
                        {item.hasTempOption ? (
                          <>
                            {/* Hot */}
                            <div className="flex items-center gap-0.5">
                              <span className="text-[10px] text-red-400 font-bold w-5">Hot</span>
                              <button onClick={() => stepQty(item.id, "hot", -1)} className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 text-gray-500 text-[10px] font-bold active:bg-gray-200">-</button>
                              <span className="w-4 text-center text-[12px] font-semibold">{item.hotQty}</span>
                              <button onClick={() => stepQty(item.id, "hot", 1)} className="w-5 h-5 flex items-center justify-center rounded bg-red-400 text-white text-[10px] font-bold active:bg-red-500">+</button>
                            </div>
                            {/* Ice */}
                            <div className="flex items-center gap-0.5 ml-2">
                              <span className="text-[10px] text-blue-400 font-bold w-5">Ice</span>
                              <button onClick={() => stepQty(item.id, "ice", -1)} className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 text-gray-500 text-[10px] font-bold active:bg-gray-200">-</button>
                              <span className="w-4 text-center text-[12px] font-semibold">{item.iceQty}</span>
                              <button onClick={() => stepQty(item.id, "ice", 1)} className="w-5 h-5 flex items-center justify-center rounded bg-blue-400 text-white text-[10px] font-bold active:bg-blue-500">+</button>
                            </div>
                          </>
                        ) : (
                          /* 디저트 / 온도 없는 음료: 단순 +/- */
                          <div className="flex items-center gap-1">
                            <button onClick={() => stepQty(item.id, "hot", -1)} className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs font-bold active:bg-gray-200">-</button>
                            <span className="w-5 text-center text-[13px] font-semibold">{item.hotQty}</span>
                            <button onClick={() => stepQty(item.id, "hot", 1)} className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold active:bg-amber-600">+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {categoryTotals[pageIdx] > 0 && (
                <div className="mt-2 px-3 py-2 bg-amber-50 rounded-lg flex justify-between items-center">
                  <span className="text-xs text-amber-700 font-medium">{category} 소계</span>
                  <span className="text-sm font-bold text-amber-600">{formatWon(categoryTotals[pageIdx])}원</span>
                </div>
              )}
            </section>
          );
        })}

        {/* ── 주문내역 페이지 ── */}
        <section className="min-w-full w-full overflow-y-auto px-2 py-2" style={{ scrollSnapAlign: "start" }}>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-4xl mb-2">📋</span>
              <p className="text-sm">주문 내역이 없습니다</p>
              <p className="text-xs mt-1">메뉴를 선택하고 주문완료를 눌러주세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* 주문 헤더 */}
                  <div className="flex items-center justify-between px-3 py-2 bg-amber-50 border-b border-amber-200">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                        #{order.id}
                      </span>
                      <span className="text-[11px] text-gray-500">{order.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-600">{formatWon(order.total)}원</span>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="px-2 py-1 text-[10px] font-bold text-white bg-red-400 rounded active:bg-red-500"
                      >
                        서빙완료
                      </button>
                    </div>
                  </div>
                  {/* 주문 항목 */}
                  <div className="divide-y divide-gray-100">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] text-gray-700">{item.name}</span>
                          {item.temp && (
                            <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                              item.temp === "Hot" ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"
                            }`}>
                              {item.temp}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400">x{item.qty}</span>
                        </div>
                        <span className="text-[12px] font-semibold text-gray-600">{formatWon(item.subtotal)}원</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── 하단: 선택 메뉴 + 총합 ── */}
      <footer className="flex-shrink-0 bg-white border-t-2 border-amber-400 px-3 py-2">
        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5 max-h-[52px] overflow-y-auto">
            {selectedItems.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-700">
                {item.name}
                {item.hasTempOption ? (
                  <>
                    {item.hotQty > 0 && <span className="text-red-400 font-bold">H{item.hotQty}</span>}
                    {item.iceQty > 0 && <span className="text-blue-400 font-bold">I{item.iceQty}</span>}
                  </>
                ) : (
                  <span className="font-bold">x{item.hotQty}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            전체 총합 <span className="text-gray-400">({selectedItems.length}종 / {totalQuantity}개)</span>
          </p>
          <p className={`text-xl font-extrabold ${grandTotal > 0 ? "text-amber-600" : "text-gray-300"}`}>
            {formatWon(grandTotal)}원
          </p>
        </div>
      </footer>
    </div>
  );
}
