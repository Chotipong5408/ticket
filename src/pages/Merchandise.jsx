import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { ShirtArt } from "../components/ShirtArt";
import { merchRepo } from "../repositories";
import { addMerchToCart, quoteCart } from "../services/orderService";
import { formatTHB } from "../lib/money";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLiveData } from "../hooks/useLiveData";
import {
  Shirt,
  ShoppingCart,
  Ticket,
  Plus,
  Minus,
} from "lucide-react";

export default function Merchandise() {
  useLiveData();
  const products = merchRepo.all().filter((p) => p.isActive).map((p) => {
    if (p.id === 'mer_polo' && (!p.stockEnabled || !p.stockBySize || Object.keys(p.stockBySize).length === 0)) {
      return {
        ...p,
        stockEnabled: true,
        stockBySize: { S: 15, M: 30, L: 35, XL: 25, '2XL': 15, '3XL': 10 },
      }
    }
    return p
  });
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [size, setSize] = useState({});
  const [qty, setQty] = useState({});

  const cart = user ? quoteCart(user.id) : null;
  const cartCount = cart ? cart.items.length : 0;

  function add(p) {
    if (!user) return nav("/login");
    const selectedSize = size[p.id] || p.sizes?.[0] || "L";
    const availableStock = p.stockEnabled ? (p.stockBySize?.[selectedSize] || 0) : 50;
    const selectedQty = Math.max(1, parseInt(qty[p.id], 10) || 1);

    if (p.stockEnabled && availableStock <= 0) {
      toast.push(`ขออภัย สินค้าไซส์ ${selectedSize} หมดชั่วคราว`, "error");
      return;
    }
    if (p.stockEnabled && selectedQty > availableStock) {
      toast.push(`ขออภัย ไซส์ ${selectedSize} มีสินค้าเหลือเพียง ${availableStock} ชิ้น`, "error");
      return;
    }
    try {
      addMerchToCart(user.id, p.id, selectedSize, selectedQty);
      toast.push(
        `เพิ่ม ${p.name} (ไซส์ ${selectedSize}) x${selectedQty} ในตะกร้าแล้ว`,
        "success",
      );
    } catch (e) {
      toast.push(e.message, "error");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10 space-y-8 animate-fade-in">
      {/* ─── Top Flow Stepper & Cart Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white border border-slate-200/90 p-3 sm:p-4 shadow-xs">
        {/* Step Progress Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold overflow-x-auto pb-1 sm:pb-0">
          <Link
            to="/tickets"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3.5 py-2 text-slate-600 hover:text-slate-900 transition shrink-0"
          >
            <Ticket className="h-3.5 w-3.5 text-slate-400" />
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600">
              1
            </span>
            <span>เลือกบัตรเข้างาน</span>
          </Link>

          <span className="text-slate-300 font-bold px-1">→</span>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2 text-white shadow-sm shadow-brand-500/20 shrink-0">
            <Shirt className="h-3.5 w-3.5 text-white" />
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-black text-brand-700">
              2
            </span>
            <span>เสื้อที่ระลึก</span>
          </div>

          <span className="text-slate-300 font-bold px-1">→</span>

          <Link
            to="/checkout"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3.5 py-2 text-slate-600 hover:text-slate-900 transition shrink-0"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-slate-400" />
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600">
              3
            </span>
            <span>ชำระเงิน</span>
          </Link>
        </div>

        {/* Cart Quick Button */}
        <button
          type="button"
          onClick={() => nav("/checkout")}
          className="btn-primary text-xs gap-2 py-2.5 px-5 self-end sm:self-auto shrink-0 shadow-sm"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>ตะกร้าสินค้า ({cartCount})</span>
          {cart && cart.totalAmount > 0 && (
            <span className="ml-1 rounded-lg bg-white/20 px-2 py-0.5 text-[11px] font-extrabold">
              {formatTHB(cart.totalAmount)}
            </span>
          )}
        </button>
      </div>

      <PageHeader
        title="เสื้อที่ระลึกงานเลี้ยงรุ่น 2026"
        subtitle="ผ้าคอตตอนคุณภาพพรีเมียม ใส่สบาย พร้อมสกรีนลายพิเศษศิษย์เก่า 2026"
        icon={Shirt}
      />

      {products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 max-w-md mx-auto">
          <Shirt className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="font-medium text-slate-700">
            ยังไม่มีสินค้าเปิดจำหน่ายในขณะนี้
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((p) => {
            const currentSize = size[p.id] || p.sizes?.[0] || "L";
            const availableStock = p.stockEnabled ? (p.stockBySize?.[currentSize] || 0) : 50;
            const maxQty = p.stockEnabled ? Math.max(0, availableStock) : 50;
            const isOutOfStock = p.stockEnabled && availableStock <= 0;
            const currentQty = isOutOfStock ? 0 : Math.min(maxQty, Math.max(1, parseInt(qty[p.id], 10) || 1));

            return (
              <div
                key={p.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <ShirtArt kind={p.imageKind} />

                  <div className="mt-5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-xl font-bold text-slate-800">
                        {p.name}
                      </h2>
                      <span className="text-2xl font-extrabold text-brand-700">
                        {formatTHB(p.price)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Size selection */}
                  <div className="mt-6 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      เลือกขนาดเสื้อ (Size)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {p.sizes.map((s) => {
                        const isSelected = currentSize === s;
                        const stock = p.stockEnabled
                          ? p.stockBySize?.[s] || 0
                          : null;
                        const isSizeOutOfStock = p.stockEnabled && stock <= 0;

                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={isSizeOutOfStock}
                            onClick={() => {
                              setSize({ ...size, [p.id]: s });
                              const sStock = p.stockEnabled ? (p.stockBySize?.[s] || 0) : 50;
                              const current = parseInt(qty[p.id], 10) || 1;
                              if (sStock <= 0) {
                                setQty({ ...qty, [p.id]: 0 });
                              } else if (current > sStock) {
                                setQty({ ...qty, [p.id]: sStock });
                              } else if (current < 1) {
                                setQty({ ...qty, [p.id]: 1 });
                              }
                            }}
                            className={`min-w-[48px] rounded-xl px-3 py-2 text-xs font-bold transition-all border ${
                              isSelected
                                ? "bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-500/20"
                                : isSizeOutOfStock
                                  ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50/50"
                            }`}
                          >
                            <div>{s}</div>
                            {stock !== null && (
                              <div className="text-[10px] font-normal opacity-75">
                                ({stock})
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                        จำนวน
                      </label>
                      {p.stockEnabled && (
                        <span className="text-[11px] text-slate-400">
                          สต็อกคงเหลือ: <strong className={availableStock > 0 ? "text-slate-700" : "text-red-500 font-bold"}>{availableStock} ชิ้น</strong>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isOutOfStock || currentQty <= 1}
                        onClick={() => {
                          const current = parseInt(qty[p.id], 10) || 1;
                          setQty({ ...qty, [p.id]: Math.max(1, current - 1) });
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        title="ลดจำนวน"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        className="input w-20 text-center font-bold disabled:bg-slate-100 disabled:text-slate-400"
                        type="number"
                        min="1"
                        max={Math.min(999999999, maxQty)}
                        disabled={isOutOfStock}
                        value={isOutOfStock ? 0 : qty[p.id] !== undefined ? qty[p.id] : 1}
                        onFocus={(e) => e.target.select()}
                        onInput={(e) => {
                          if (e.target.value.length > 9) e.target.value = e.target.value.slice(0, 9);
                        }}
                        onChange={(e) => {
                          const val = e.target.value.slice(0, 9);
                          if (val === '') {
                            setQty({ ...qty, [p.id]: '' });
                          } else {
                            const num = parseInt(val, 10);
                            if (!isNaN(num)) {
                              setQty({ ...qty, [p.id]: Math.min(maxQty, Math.max(0, num)) });
                            }
                          }
                        }}
                        onBlur={() => {
                          const num = parseInt(qty[p.id], 10);
                          if (isNaN(num) || num < 1) {
                            setQty({ ...qty, [p.id]: maxQty > 0 ? 1 : 0 });
                          } else if (num > maxQty) {
                            setQty({ ...qty, [p.id]: maxQty });
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={isOutOfStock || currentQty >= maxQty}
                        onClick={() => {
                          const current = parseInt(qty[p.id], 10) || 1;
                          setQty({ ...qty, [p.id]: Math.min(maxQty, current + 1) });
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        title="เพิ่มจำนวน"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    className="btn-primary w-full py-3 text-xs font-bold gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    type="button"
                    disabled={isOutOfStock || maxQty <= 0}
                    onClick={() => add(p)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isOutOfStock
                      ? "สินค้าไซส์นี้หมดชั่วคราว"
                      : `เพิ่มเสื้อลงตะกร้า (${formatTHB(p.price * currentQty)})`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sizing Guide Helper Card */}
      <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-200/80 p-5 text-xs text-slate-600">
        <h4 className="font-bold text-slate-800 mb-1">
          ตารางขนาดรอบอกโดยประมาณ (นิ้ว)
        </h4>
        <p className="text-slate-500">
          S: 36" | M: 38" | L: 40" | XL: 42" | 2XL: 44" | 3XL: 46"
        </p>
      </div>
    </div>
  );
}
