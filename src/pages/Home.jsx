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
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";

const steps = [
  {
    icon: GraduationCap,
    step: "01",
    title: "ข้อมูลผู้ใช้",
    desc: "ลงทะเบียนเข้าสู่ระบบศิษย์เก่า",
    to: "/register",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Ticket,
    step: "02",
    title: "เลือกซื้อบัตร",
    desc: "เลือกบัตรเข้างานตามประเภทที่ต้องการ",
    to: "/tickets",
    color: "from-indigo-500 to-purple-600",
  },
  {
    icon: Shirt,
    step: "03",
    title: "เสื้อที่ระลึก",
    desc: "เลือกไซส์และสั่งเสื้อรุ่นพิเศษ 2026",
    to: "/merchandise",
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: CreditCard,
    step: "04",
    title: "ชำระเงิน",
    desc: "สแกน Thai QR พร้อมแนบสลิปโอนเงิน",
    to: "/tickets",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: QrCode,
    step: "05",
    title: "รับ QR Ticket",
    desc: "รับบัตรเข้างานดิจิทัลหลัง Admin อนุมัติ",
    to: "/account/tickets",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Coins,
    step: "06",
    title: "ใช้ Token ในงาน",
    desc: "สแกนซื้ออาหาร เครื่องดื่ม ร้านค้าภายในงาน",
    to: "/account/wallet",
    color: "from-cyan-500 to-blue-600",
  },
];

const demoAccounts = [
  {
    label: "ผู้ใช้ทั่วไป (User)",
    email: "user@demo.com",
    role: "user",
    badge: "ผู้เข้าร่วมงาน",
    desc: "ซื้อบัตร, สั่งเสื้อ, ดู QR Ticket, ใช้ Wallet",
  },
  {
    label: "Super Admin",
    email: "superadmin@demo.com",
    role: "super_admin",
    badge: "ผู้ดูแลสูงสุด",
    desc: "ตรวจสลิป, อนุมัติบัตร, รายงาน, สแกน Check-in",
  },
  {
    label: "Event Admin",
    email: "tokenadmin@demo.com",
    role: "token_admin",
    badge: "จุดเติมเงิน",
    desc: "จุดบริการเติม Token ให้ผู้ร่วมงาน",
  },
  {
    label: "Store Admin",
    email: "store1@demo.com",
    role: "store_admin",
    badge: "ร้านค้าในงาน",
    desc: "สร้าง QR ขายของ, รับชำระด้วย Token",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-900 to-brand-800 text-white shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-brand-200 border border-white/15 mb-6 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>ระบบลงทะเบียนและจำหน่ายบัตรออนไลน์ 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            งานเลี้ยงรุ่นศิษย์เก่า{" "}
            <span className="bg-gradient-to-r from-brand-200 via-sky-200 to-white bg-clip-text text-transparent">
              2026
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            ร่วมย้อนวันวานพบปะเพื่อนร่วมรุ่น สะดวก รวดเร็ว ด้วยระบบบัตรดิจิทัล
            QR Ticket พร้อมระบบกระเป๋าเงิน Token ไร้เงินสดภายในงาน
          </p>

          {/* Event Quick Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 mb-10">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-sm">
              <Calendar className="h-3.5 w-3.5 text-brand-300" />
              <span>เสาร์ที่ 14 พฤศจิกายน 2026</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5 text-brand-300" />
              <span>18:00 - 23:00 น.</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5 text-brand-300" />
              <span>หอประชุมใหญ่ ศิษย์เก่าสัมพันธ์</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-300 hover:to-brand-400 text-slate-900 font-bold px-7 py-3.5 shadow-lg shadow-brand-500/25 transition duration-200 hover:scale-[1.02]"
                >
                  ลงทะเบียนทันที <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/tickets"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 border border-white/20 backdrop-blur-sm transition duration-200"
                >
                  <Ticket className="h-4 w-4" /> ดูประเภทบัตร
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/tickets"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-300 hover:to-brand-400 text-slate-900 font-bold px-7 py-3.5 shadow-lg shadow-brand-500/25 transition duration-200 hover:scale-[1.02]"
                >
                  <Ticket className="h-4 w-4" /> ซื้อบัตรเข้างาน
                </Link>
                <Link
                  to="/account"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 border border-white/20 backdrop-blur-sm transition duration-200"
                >
                  เข้าสู่หน้าบัญชีของฉัน <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Flow Steps */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            ขั้นตอนการเข้าร่วมงาน
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            6 ขั้นตอนง่ายๆ ในการลงทะเบียน ซื้อบัตร และเพลิดเพลินในงาน
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.step}
                to={s.to}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${s.color} text-white shadow-md shadow-brand-500/10 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-2xl font-black text-slate-200 group-hover:text-brand-500 transition-colors">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1.5 group-hover:text-brand-600 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-brand-600 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  ดำเนินการ <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Highlights / Features Banner */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Token & Store */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white to-blue-50/50 p-8 shadow-sm hover:shadow-md transition">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-4 border border-amber-200/60">
              <Store className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              ระบบ Token & ร้านค้าในงาน
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              ไม่ต้องพกเงินสดให้ยุ่งยาก รับ Token โบนัสทันทีเมื่อซื้อบัตร
              และเติมเงินได้ที่จุดบริการ สแกน QR ชำระค่าอาหาร เครื่องดื่ม
              และของที่ระลึกได้ทันที
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/account/wallet"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 hover:bg-slate-800 transition"
              >
                ดู Token Wallet ของฉัน <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/tickets"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
              >
                ดูโบนัสแต่ละประเภทบัตร →
              </Link>
            </div>
          </div>

          {/* Card 2: Admin & Checkin */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white to-indigo-50/50 p-8 shadow-sm hover:shadow-md transition">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 mb-4 border border-brand-200/60">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              ระบบจัดการและตรวจสอบ Real-time
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Super Admin สามารถตรวจสอบสลิปโอนเงิน อนุมัติบัตรอัตโนมัติ สแกน
              Check-in ผู้เข้าร่วมหน้างาน
              พร้อมรายงานสรุปรายได้แยกหมวดหมู่อย่างโปร่งใส
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold px-4 py-2.5 hover:bg-brand-700 transition"
              >
                เข้าสู่ Admin Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/admin/checkin"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                ระบบ Check-in หน้างาน →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Accounts Showcase */}
      <section className="mx-auto max-w-5xl px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200/60 px-3.5 py-1 text-xs font-semibold text-brand-700 mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
              <span>โหมดทดสอบระบบ (Demo Mode)</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              บัญชี Demo สำหรับทดลองใช้งาน
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              คลิกปุ่มเข้าสู่ระบบของแต่ละบทบาท หรือใช้รหัสผ่านกลาง:{" "}
              <code className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md text-brand-700 font-mono font-bold">
                {DEMO_PASSWORD}
              </code>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {demoAccounts.map((a) => (
              <div
                key={a.email}
                className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-brand-300 p-5 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">{a.label}</span>
                    <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                      {a.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 font-mono bg-white/80 border border-slate-200/50 rounded-lg px-2.5 py-1 inline-block">
                    {a.email}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {a.desc}
                  </p>
                </div>
                <Link
                  to="/login"
                  className="w-full text-center rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-colors shadow-sm"
                >
                  เข้าสู่ระบบด้วยบัญชีนี้
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 text-xs text-amber-800 flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong>หมายเหตุการทำงาน:</strong> ข้อมูลทั้งหมดในระบบ Demo
              นี้จำลองและจัดเก็บอยู่ในพื้นที่ Browser (LocalStorage & IndexedDB)
              ของเครื่องคุณ จึงสามารถทดสอบ ซื้อบัตร แนบสลิป ตรวจสอบ และชำระ
              Token ได้อย่างสมบูรณ์แบบโดยไม่ต้องต่อฐานข้อมูลภายนอก
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
