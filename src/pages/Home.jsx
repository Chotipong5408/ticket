import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroBanquetImg from "../assets/hero-banquet.jpg";
import {
  Ticket,
  Shirt,
  CreditCard,
  QrCode,
  Coins,
  ArrowRight,
  GraduationCap,
  Calendar,
  MapPin,
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

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4 sm:pt-6">
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl border border-slate-800/80 min-h-[480px] sm:min-h-[520px] md:min-h-[560px] flex items-center">
          {/* Background Banquet Hall Image */}
          <img
            src={heroBanquetImg}
            alt="งานเลี้ยงรุ่นศิษย์เก่า 2026"
            className="absolute inset-0 h-full w-full object-cover object-right md:object-center select-none"
          />

          {/* Dark Vignette & Brand Gradient Overlays for High Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent sm:via-slate-950/80 md:to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent sm:hidden" />
          <div className="absolute inset-0 bg-brand-950/20 mix-blend-multiply" />

          {/* Subtle Glow Effects */}
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />

          {/* Left-Aligned Hero Content Matching the Sample Reference */}
          <div className="relative z-10 w-full px-6 py-12 sm:px-10 sm:py-16 md:px-14 md:py-20 lg:py-24">
            <div className="max-w-2xl text-left">
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 leading-tight sm:leading-snug drop-shadow-sm">
                <span className="block">งานเลี้ยงรุ่น</span>
                <span className="block">ศิษย์เก่า 2026</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-slate-200 mb-8 sm:mb-10 font-normal leading-relaxed max-w-xl drop-shadow-sm">
                กลับมาเจอกันอีกครั้ง ความทรงจำยังคงเดิม
              </p>

              {/* Event Info Row (Date & Location Badges) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 mb-8 sm:mb-10">
                {/* Date & Time */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-brand-300 shadow-sm">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm sm:text-base font-bold text-white leading-snug">
                      เสาร์ที่ 20 ธันวาคม 2568
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300 font-normal">
                      เวลา 18:00 - 22:00 น.
                    </div>
                  </div>
                </div>

                {/* Venue & City */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-brand-300 shadow-sm">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm sm:text-base font-bold text-white leading-snug">
                      โรงแรม Luv Town
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300 font-normal">
                      กรุงเทพมหานคร
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Actions using Original Website Brand Theme */}
              <div className="flex items-center gap-3.5 sm:gap-4 flex-wrap">
                <Link
                  to={user ? "/tickets" : "/login?redirect=/tickets"}
                  className="inline-flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-bold px-7 sm:px-8 py-3.5 text-sm sm:text-base shadow-lg shadow-brand-600/30 transition-all duration-200 hover:scale-[1.02]"
                >
                  ซื้อตั๋วเลย
                </Link>

                <a
                  href="#details"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 hover:border-white bg-slate-900/40 hover:bg-white/10 text-white font-semibold px-7 sm:px-8 py-3.5 text-sm sm:text-base backdrop-blur-md transition-all duration-200"
                >
                  ดูรายละเอียด
                </a>

                {user && (
                  <Link
                    to="/account"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-200 hover:text-white px-3 py-2 transition"
                  >
                    <span>บัญชีของฉัน ({user.fullName})</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Details Section Anchor */}
      <div id="details" className="scroll-mt-24 space-y-16">
        {/* Flow Steps */}
        <section className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200/60 px-3.5 py-1 text-xs font-semibold text-brand-700 mb-2">
              <span>ขั้นตอนง่ายๆ 6 ขั้นตอน</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              ขั้นตอนการเข้าร่วมงาน
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              ลงทะเบียน ซื้อบัตร และเพลิดเพลินกับงานเลี้ยงรุ่นอย่างสะดวกสบาย
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
      </div>
    </div>
  );
}
