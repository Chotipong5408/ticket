import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEMO_PASSWORD } from "../data/seed";
import {
  Ticket,
  Shirt,
  CreditCard,
  QrCode,
  Coins,
  Store,
  BarChart3,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    icon: GraduationCap,
    title: "1. ข้อมูลผู้ใช้",
    desc: "ลงทะเบียนเข้าสู่ระบบ",
    to: "/register",
  },
  {
    icon: Ticket,
    title: "2. ซื้อบัตร",
    desc: "เลือกประเภทบัตรเข้างาน",
    to: "/tickets",
  },
  {
    icon: Shirt,
    title: "3. เลือกซื้อเสื้อ",
    desc: "เสื้อที่ระลึกงานเลี้ยงรุ่น",
    to: "/merchandise",
  },
  {
    icon: CreditCard,
    title: "4. ชำระเงิน",
    desc: "สแกน Thai QR แนบสลิป",
    to: "/tickets",
  },
  {
    icon: QrCode,
    title: "5. ออก QR Ticket",
    desc: "รับบัตรหลังอนุมัติ",
    to: "/account/tickets",
  },
  {
    icon: Coins,
    title: "6. ใช้ Token ในงาน",
    desc: "ซื้ออาหาร เครื่องดื่ม",
    to: "/account/wallet",
  },
];

const demoAccounts = [
  { label: "ผู้ใช้ (User)", email: "user@demo.com", role: "user" },
  { label: "Super Admin", email: "superadmin@demo.com", role: "super_admin" },
  { label: "Token Admin", email: "tokenadmin@demo.com", role: "token_admin" },
  { label: "Store Admin", email: "store1@demo.com", role: "store_admin" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-blue-500 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22g%22%20patternUnits%3D%22userSpaceOnUse%22%20width%3D%2240%22%20height%3D%2240%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%221.5%22%20fill%3D%22rgba(255%2C255%2C255%2C0.08)%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect%20fill%3D%22url(%23g)%22%20width%3D%22200%22%20height%3D%22200%22/%3E%3C/svg%3E')] opacity-40" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center">
          <GraduationCap className="mx-auto h-16 w-16 mb-4 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            งานเลี้ยงรุ่นศิษย์เก่า 2026
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            ระบบลงทะเบียนและขายบัตร
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {!user && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 font-semibold px-6 py-3 shadow hover:bg-brand-50 transition"
              >
                ลงทะเบียน <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              to="/tickets"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 text-white font-semibold px-6 py-3 hover:bg-white/10 transition"
            >
              ซื้อบัตร <Ticket className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Flow Steps */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-10">
          ขั้นตอนการใช้งาน
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <Link
                key={i}
                to={s.to}
                className="group card text-center hover:shadow-md hover:border-brand-200 transition-all"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500">{s.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Additional sections */}
      <section className="bg-white border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-8">
          <div className="card hover:shadow-md transition">
            <Store className="h-8 w-8 text-brand-600 mb-3" />
            <h3 className="text-lg font-semibold mb-2">ร้านค้า / Token</h3>
            <p className="text-sm text-slate-600 mb-4">
              ใช้ Token ซื้ออาหารและเครื่องดื่มภายในงาน สแกน QR จ่ายง่าย รวดเร็ว
            </p>
            <Link
              to="/account/wallet"
              className="text-sm text-brand-600 font-medium hover:underline"
            >
              ดู Wallet →
            </Link>
          </div>
          <div className="card hover:shadow-md transition">
            <BarChart3 className="h-8 w-8 text-brand-600 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Admin Report</h3>
            <p className="text-sm text-slate-600 mb-4">
              Super Admin สามารถดูรายงานยอดขาย จำนวนผู้เข้าร่วม และ Audit Log
              ทั้งหมด
            </p>
            <Link
              to="/admin/dashboard"
              className="text-sm text-brand-600 font-medium hover:underline"
            >
              ไปที่ Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Accounts */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          บัญชี Demo สำหรับทดลอง
        </h2>
        <p className="text-center text-slate-500 text-sm mb-8">
          รหัสผ่านทุกบัญชี:{" "}
          <code className="bg-slate-200 px-2 py-0.5 rounded text-brand-700 font-mono">
            {DEMO_PASSWORD}
          </code>
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {demoAccounts.map((a) => (
            <div
              key={a.email}
              className="card flex items-center gap-4 hover:shadow-md transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{a.label}</p>
                <p className="text-sm text-slate-500 font-mono">{a.email}</p>
              </div>
              <Link to="/login" className="ml-auto text-sm btn-secondary">
                เข้าสู่ระบบ
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <ShieldCheck className="inline h-4 w-4 mr-1" />
          <strong>หมายเหตุ:</strong> บัญชี Demo นี้สำหรับการทดสอบเท่านั้น
          ข้อมูลจัดเก็บใน Browser (LocalStorage/IndexedDB)
          และจะหายไปเมื่อล้างข้อมูล Browser
        </div>
      </section>
    </div>
  );
}
