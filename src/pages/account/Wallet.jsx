import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { QrBox } from "../../components/QrBox";
import { useAuth } from "../../context/AuthContext";
import { walletSummary } from "../../services/tokenService";
import { formatToken, formatTHB } from "../../lib/money";
import { encodeQr } from "../../lib/qr";
import { useLiveData } from "../../hooks/useLiveData";
import { UserQrModal } from "../../components/UserQrModal";
import { settingsRepo } from "../../repositories";
import {
  Wallet,
  Coins,
  ArrowDownLeft,
  Gift,
  ShieldAlert,
  Sparkles,
  History,
  QrCode,
  Banknote,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AccountWallet() {
  useLiveData();
  const { user } = useAuth();
  const w = walletSummary(user.id);
  const settings = settingsRepo.get() || {};
  const tokenRate = Number(settings.tokenPriceTHB) || 10;
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Token Wallet ของฉัน"
        subtitle="กระเป๋าเงินดิจิทัลสำหรับใช้สแกนซื้ออาหาร เครื่องดื่ม และสินค้าภายในงานเลี้ยงรุ่น"
        icon={Wallet}
        actions={
          <Link
            to="/account/transactions"
            className="btn-secondary text-xs gap-1.5"
          >
            <History className="h-4 w-4" /> ดูประวัติธุรกรรม
          </Link>
        }
      />

      {/* Main Wallet Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-900 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4" />
              <span>ยอดคงเหลือที่สามารถใช้ได้</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight">
                {formatToken(w.balance)}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-brand-300">
                TOKEN
              </span>
            </div>

            {/* Rate & Estimated Value Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-md px-3 py-1 border border-white/15 text-xs text-brand-200">
                <Coins className="h-3.5 w-3.5 text-amber-300" />
                <span>เรทระบบ: <strong className="text-white font-bold">1 Token = {tokenRate} บาท</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-md px-3 py-1 border border-white/15 text-xs text-brand-200">
                <Banknote className="h-3.5 w-3.5 text-emerald-300" />
                <span>มูลค่าเทียบเท่า: <strong className="text-emerald-300 font-bold">{formatTHB(w.balance * tokenRate)}</strong></span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              เจ้าของบัญชี:{" "}
              <span className="text-white font-medium">{user.fullName}</span>{" "}
              (ID: <code className="font-mono text-brand-200">{user.id}</code>)
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-900 font-bold px-5 py-3 text-xs shadow-lg transition"
            >
              <QrCode className="h-4 w-4" /> เปิด QR ชำระเงิน
            </button>
          </div>
        </div>
      </div>

      {/* Rate Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">อัตราแลกเปลี่ยน Token ตามระบบ</h3>
              <p className="text-xs text-slate-500">กำหนดโดยผู้ดูแลระบบ (Super Admin) สำหรับการใช้จ่ายและเติมเงินในงาน</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-black text-sm self-start sm:self-auto">
            <span>1 Token</span>
            <span className="text-amber-400">＝</span>
            <span className="text-brand-600">{tokenRate} บาท</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3">
          * สมาชิกสามารถยื่น QR Code ประจำตัวที่จุดบริการ Event Admin เพื่อชำระเงินสดและเติม Token เข้ากระเป๋าได้ทันที
        </p>
      </div>

      {/* Stats Breakdown Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Bonus */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              โบนัสจากบัตร
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Gift className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">
            {formatToken(w.bonus)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            ได้รับอัตโนมัติเมื่อชำระค่าบัตร
          </p>
        </div>

        {/* Topup */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              เติมเพิ่มหน้างาน
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-700">
            {formatToken(w.topup)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            เติมเงินสดผ่าน Event Admin
          </p>
        </div>

        {/* Spent */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ยอดที่ใช้จ่ายไป
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-700">
            {formatToken(w.spent)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            ใช้จ่ายที่ร้านค้าในงาน
          </p>
        </div>
      </div>

      {/* QR for Payment/Top-up & Policy */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <h3 className="font-bold text-slate-800 text-sm mb-1">
            QR ประจำตัว — ชำระเงินและเติม Token
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            ยื่น QR นี้ให้ร้านค้าในงานสแกนตัด Token หรือให้เจ้าหน้าที่จุดเติมเงิน (Event Admin) สแกนเพิ่มยอด
          </p>
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 text-xs shadow transition"
            >
              <QrCode className="h-4 w-4" /> แสดง QR เต็มจอ
            </button>
            <div className="flex justify-center">
              <QrBox
                value={encodeQr("user", user.id)}
                label="User Token QR"
                caption={`บัญชี: ${user.fullName}`}
                downloadName={`${user.id}-payment-qr.png`}
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>ข้อกำหนดและการใช้งาน Token</span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <p>
              • <strong>ไม่สามารถแลกคืนเป็นเงินสดได้:</strong> Token
              ที่ได้รับจากโบนัสหรือการเติมเงินมีไว้สำหรับใช้ซื้ออาหาร
              เครื่องดื่ม และของที่ระลึกภายในงานเท่านั้น
            </p>
            <p>
              • <strong>ความโปร่งใสและตรวจสอบได้:</strong>{" "}
              ยอดคงเหลือคำนวณจากบันทึกธุรกรรม (Audit Ledger) ทั้งหมดในระบบ
              ไม่สามารถแก้ไขตัวเลขด้วยตนเองได้
            </p>
            <p>
              • <strong>หากพบข้อผิดพลาด:</strong>{" "}
              กรุณาติดต่อจุดประชาสัมพันธ์หรือ Super Admin
              เพื่อตรวจสอบประวัติธุรกรรม
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              to="/account/transactions"
              className="btn-secondary w-full text-xs text-center"
            >
              ตรวจสอบบันทึกธุรกรรมฉบับเต็ม →
            </Link>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <UserQrModal open={qrOpen} onClose={() => setQrOpen(false)} user={user} />
    </div>
  );
}
