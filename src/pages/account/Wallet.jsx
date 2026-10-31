import { PageHeader } from "../../components/ui/PageHeader";
import { QrBox } from "../../components/QrBox";
import { useAuth } from "../../context/AuthContext";
import { walletSummary } from "../../services/tokenService";
import { formatToken } from "../../lib/money";
import { encodeQr } from "../../lib/qr";
import { useLiveData } from "../../hooks/useLiveData";
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  ShieldAlert,
  Sparkles,
  History,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AccountWallet() {
  useLiveData();
  const { user } = useAuth();
  const w = walletSummary(user.id);

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
            <p className="text-xs text-slate-400 mt-2">
              เจ้าของบัญชี:{" "}
              <span className="text-white font-medium">{user.fullName}</span>{" "}
              (ID: <code className="font-mono text-brand-200">{user.id}</code>)
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/scan-payment"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-900 font-bold px-5 py-3 text-xs shadow-lg transition"
            >
              <ArrowUpRight className="h-4 w-4" /> สแกนจ่ายร้านค้า
            </Link>
          </div>
        </div>
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

      {/* QR for Top-up & Policy */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <h3 className="font-bold text-slate-800 text-sm mb-1">
            QR ประจำตัวสำหรับเติม Token
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            แสดง QR Code นี้แก่เจ้าหน้าที่จุดเติม Token (Event Admin)
            เพื่อเติมเงินเข้ากระเป๋า
          </p>
          <div className="flex justify-center">
            <QrBox
              value={encodeQr("user", user.id)}
              label="User Token QR"
              caption={`บัญชี: ${user.fullName}`}
              downloadName={`${user.id}-topup-qr.png`}
            />
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
    </div>
  );
}
