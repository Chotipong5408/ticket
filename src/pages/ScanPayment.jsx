import { useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { QrScanner } from "../components/QrScanner";
import { decodeQr } from "../lib/qr";
import { requestsRepo, storesRepo } from "../repositories";
import { payStoreRequest } from "../services/storeService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatToken } from "../lib/money";
import { walletSummary } from "../services/tokenService";
import {
  ScanLine,
  Store,
  Coins,
  CheckCircle2,
  ArrowRight,
  Wallet,
  ShoppingBag,
} from "lucide-react";

export default function ScanPayment() {
  const { user } = useAuth();
  const toast = useToast();
  const [manual, setManual] = useState("");
  const [req, setReq] = useState(null);

  const wallet = user ? walletSummary(user.id) : { balance: 0 };

  function resolve(raw) {
    if (!raw?.trim()) return;
    const decoded = decodeQr(raw.trim());
    const token = decoded?.type === "store" ? decoded.token : raw.trim();
    const found = requestsRepo.findByQr(token) || requestsRepo.findById(token);
    if (!found) {
      toast.push("ไม่พบรายการ QR ร้านค้านี้ หรือรหัสไม่ถูกต้อง", "error");
      return;
    }
    setReq(found);
  }

  function pay() {
    try {
      payStoreRequest(user, req.id);
      toast.push("ชำระด้วย Token สำเร็จแล้ว", "success");
      setReq(requestsRepo.findById(req.id));
    } catch (e) {
      toast.push(e.message, "error");
    }
  }

  const store = req ? storesRepo.findById(req.storeId) : null;
  const canAfford = req ? wallet.balance >= req.amountToken : false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="สแกนจ่ายร้านค้าด้วย Token"
        subtitle="ใช้กล้องสแกน QR Code หน้าร้านค้าเพื่อชำระค่าสินค้าและเครื่องดื่มด้วย Token ในกระเป๋า"
        icon={ScanLine}
      />

      {/* Wallet Balance Strip */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-brand-900 p-5 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-300">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">
              Token คงเหลือในกระเป๋าของคุณ
            </p>
            <p className="text-2xl font-black text-brand-300">
              {formatToken(wallet.balance)} Token
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Scanner Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ScanLine className="h-4 w-4 text-brand-600" />
            <span className="font-bold text-sm text-slate-800">
              กล้องสแกน QR ร้านค้า
            </span>
          </div>

          <QrScanner onResult={resolve} />

          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">
              หรือกรอกรหัส QR / Request ID โดยตรง
            </label>
            <div className="flex gap-2">
              <input
                className="input text-xs"
                placeholder="วางรหัส QR หรือ Request ID เช่น REQ-..."
                value={manual}
                onChange={(e) => setManual(e.target.value)}
              />
              <button
                className="btn-secondary text-xs px-4"
                type="button"
                onClick={() => resolve(manual)}
              >
                ตรวจสอบ
              </button>
            </div>
          </div>
        </div>

        {/* Bill / Payment Request Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <ShoppingBag className="h-4 w-4 text-brand-600" />
            <span className="font-bold text-sm text-slate-800">
              รายละเอียดรายการชำระเงิน
            </span>
          </div>

          {!req ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Store className="mx-auto h-12 w-12 text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-medium">ยังไม่มีรายการที่สแกน</p>
              <p className="text-[11px] text-slate-400">
                สแกน QR ที่หน้าร้านค้าเพื่อเรียกดูยอดและยืนยันการจ่าย
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] text-slate-400">ร้านค้า</span>
                    <p className="font-bold text-slate-800 text-base">
                      {store?.name || "ร้านค้า"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      req.status === "open"
                        ? "bg-amber-100 text-amber-800"
                        : req.status === "paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {req.status === "open"
                      ? "รอชำระ"
                      : req.status === "paid"
                        ? "ชำระแล้ว"
                        : req.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] text-slate-400">สินค้า</span>
                  <p className="text-sm font-semibold text-slate-700">
                    {req.productName} × {req.quantity}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">ยอดที่ต้องจ่าย</span>
                  <span className="text-2xl font-black text-brand-700 flex items-center gap-1">
                    <Coins className="h-5 w-5 text-amber-500" />
                    {formatToken(req.amountToken)} Token
                  </span>
                </div>
              </div>

              {req.status === "open" && (
                <div className="space-y-3">
                  {!canAfford && (
                    <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                      Token คงเหลือของคุณ ({formatToken(wallet.balance)})
                      ไม่เพียงพอสำหรับรายการนี้ กรุณาติดต่อ Event Admin
                      เพื่อเติมเงิน
                    </p>
                  )}
                  <button
                    className="btn-primary w-full py-3 font-bold text-xs gap-2"
                    type="button"
                    disabled={!canAfford}
                    onClick={pay}
                  >
                    <CheckCircle2 className="h-4 w-4" /> ยืนยันหัก{" "}
                    {formatToken(req.amountToken)} Token
                  </button>
                </div>
              )}

              {req.status === "paid" && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center text-xs text-emerald-800 space-y-1">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-1" />
                  <p className="font-bold text-sm">ชำระเงินสำเร็จแล้ว</p>
                  <p className="text-emerald-700 text-[11px]">
                    ร้านค้าได้รับ Token เรียบร้อยแล้ว
                    แสดงหน้าจอนี้ให้แก่พนักงานร้าน
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
