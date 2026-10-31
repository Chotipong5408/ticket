import { PageHeader } from "../../components/ui/PageHeader";
import { tokensRepo } from "../../repositories";
import { useAuth } from "../../context/AuthContext";
import { formatToken } from "../../lib/money";
import { useLiveData } from "../../hooks/useLiveData";
import {
  Coins,
  CircleDollarSign,
  ScanLine,
  History,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TokenDashboard() {
  useLiveData();
  const { user } = useAuth();
  const mine = tokensRepo
    .all()
    .filter((t) => t.type === "topup" && t.actorId === user.id);
  const totalTopup = mine.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-inner">
              <Coins className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  จุดบริการเติม Token
                </h1>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                  Event Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                เจ้าหน้าที่จุดบริการ:{" "}
                <span className="font-semibold text-white">
                  {user.fullName}
                </span>{" "}
                ({user.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/token-admin/topup"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold px-4 py-2.5 shadow transition"
            >
              <CircleDollarSign className="h-4 w-4" /> เติมเงินให้ผู้ใช้
            </Link>
            <Link
              to="/token-admin/scan"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-2.5 border border-white/20 backdrop-blur-sm transition"
            >
              <ScanLine className="h-4 w-4" /> สแกนตรวจสอบ
            </Link>
          </div>
        </div>
      </div>

      <PageHeader
        title="สถิติการเติมเงิน Token ของฉัน"
        subtitle="บันทึกจำนวนครั้งและยอดรวมของ Token ที่คุณได้ดำเนินการเติมเงินสดให้แก่ผู้เข้าร่วมงาน"
        icon={Coins}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              จำนวนครั้งที่เติม
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60">
              <History className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {mine.length}{" "}
              <span className="text-sm font-normal text-slate-400">ครั้ง</span>
            </p>
            <p className="text-xs text-blue-600 font-medium mt-1">
              บันทึกผ่านบัญชีนี้
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ยอด Token ที่เติมรวม
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {formatToken(totalTopup)}
            </p>
            <p className="text-xs text-amber-600 font-medium mt-1">
              Token หมุนเวียนเข้าระบบ
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/token-admin/topup"
          className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <CircleDollarSign className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">
                ทำรายการเติม Token
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ค้นหาผู้ใช้จาก QR หรืออีเมล และเติมแพ็กเกจ
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/token-admin/transactions"
          className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">
                ประวัติธุรกรรมที่บันทึก
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ตรวจสอบบันทึกการเติมเงินสดและยอดรับเงิน
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
