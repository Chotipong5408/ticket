import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { listActiveTicketTypes } from "../services/catalogService";
import {
  setTicketAttendees,
  quoteCart,
  removeTicketFromCart,
} from "../services/orderService";
import { usersRepo } from "../repositories";
import { useLiveData } from "../hooks/useLiveData";
import { formatTHB, formatToken } from "../lib/money";
import { PageHeader } from "../components/ui/PageHeader";
import {
  Ticket,
  ShoppingCart,
  Coins,
  AlertCircle,
  Shirt,
  UserPlus,
  Users,
  Trash2,
  CheckCircle2,
  Key,
  ArrowRight,
  Check,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { FACULTIES, getMajorsByFaculty } from "../data/faculties";

/** Empty attendee form template */
const emptyAttendee = () => ({
  fullName: "",
  faculty: "",
  major: "",
  enrollmentYearBE: "",
  email: "",
  phone: "",
  isOwner: false,
});

/** Validate a single attendee row; returns error string or null */
function validateAttendee(a, currentUserEmail) {
  if (!a.fullName.trim() || a.fullName.trim().length < 2)
    return "กรุณากรอกชื่อ-นามสกุล";
  if (!a.faculty.trim() || a.faculty.trim().length < 2) return "กรุณากรอกคณะ";
  if (!a.major.trim() || a.major.trim().length < 2) return "กรุณากรอกสาขา";
  const year = Number(a.enrollmentYearBE);
  if (!year || year < 2400 || year > 2600)
    return "กรุณากรอก พ.ศ. ที่เข้าเรียน (เช่น 2560)";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email))
    return "รูปแบบอีเมลไม่ถูกต้อง";
  if (!/^0\d{8,9}$/.test(a.phone))
    return "เบอร์โทรศัพท์ไม่ถูกต้อง (เช่น 0812345678)";
  // Warn if email already exists AND it's not the buyer
  if (
    !a.isOwner &&
    a.email.trim().toLowerCase() !== (currentUserEmail || "").toLowerCase()
  ) {
    const existing = usersRepo.findByEmail(a.email.trim());
    if (existing)
      return `อีเมล ${a.email} มีบัญชีในระบบแล้ว (จะใช้ข้อมูลบัญชีเดิม)`;
  }
  return null;
}

export default function Tickets() {
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  useLiveData();
  const types = listActiveTicketTypes();

  /**
   * attendeesByType: { [ticketTypeId]: [ { fullName, faculty, major, enrollmentYearBE, email, phone, isOwner } ] }
   * activeTypeId: ticketTypeId string that is currently selected for editing attendees
   */
  const [attendeesByType, setAttendeesByType] = useState({});
  const [activeTypeId, setActiveTypeId] = useState(() => (types[0]?.id || null));
  const [savedTypes, setSavedTypes] = useState(new Set()); // types already added to cart

  const cart = user ? quoteCart(user.id) : null;
  const cartCount = cart ? cart.items.length : 0;

  /** Initialize or select a ticket type */
  const selectType = (typeId) => {
    if (!user) {
      nav("/login");
      return;
    }
    setActiveTypeId(typeId);

    // Initialise with buyer's slot if not yet set
    if (!attendeesByType[typeId]) {
      setAttendeesByType((a) => ({
        ...a,
        [typeId]: [
          {
            fullName: user.fullName || "",
            faculty: user.faculty || "",
            major: user.major || "",
            enrollmentYearBE: user.enrollmentYearBE
              ? String(user.enrollmentYearBE)
              : "",
            email: user.email || "",
            phone: user.phone || "",
            isOwner: true,
          },
        ],
      }));
    }

    // Smooth scroll to attendee section
    setTimeout(() => {
      document.getElementById("attendee-workspace")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  /** Update a single field in a specific attendee slot */
  const updateField = (typeId, idx, field, value) => {
    setAttendeesByType((prev) => {
      const list = [...(prev[typeId] || [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, [typeId]: list };
    });
    // Mark as not saved when edited
    setSavedTypes((prev) => {
      const n = new Set(prev);
      n.delete(typeId);
      return n;
    });
  };

  /** Add a new blank friend slot */
  const addSlot = (typeId) => {
    setAttendeesByType((prev) => {
      const list = prev[typeId] || [];
      if (list.length >= 20) {
        toast.push("จำกัดไม่เกิน 20 ที่นั่งต่อประเภทบัตร", "error");
        return prev;
      }
      return { ...prev, [typeId]: [...list, emptyAttendee()] };
    });
    setSavedTypes((prev) => {
      const n = new Set(prev);
      n.delete(typeId);
      return n;
    });
  };

  /** Remove an attendee slot (can't remove the first/owner slot) */
  const removeSlot = (typeId, idx) => {
    setAttendeesByType((prev) => {
      const list = [...(prev[typeId] || [])];
      list.splice(idx, 1);
      return { ...prev, [typeId]: list };
    });
    setSavedTypes((prev) => {
      const n = new Set(prev);
      n.delete(typeId);
      return n;
    });
  };

  /** Save attendees to cart */
  const handleSave = (type) => {
    if (!user) {
      nav("/login");
      return;
    }
    const list = attendeesByType[type.id] || [];
    if (list.length === 0) {
      toast.push("กรุณาเพิ่มผู้เข้าร่วมงานอย่างน้อย 1 คน", "error");
      return;
    }

    // Validate each row
    const errors = [];
    const emails = [];
    list.forEach((a, i) => {
      const label = i === 0 ? "คุณ" : `เพื่อนคนที่ ${i}`;
      const err = validateAttendee(a, user.email);
      // Allow "already exists" warning but don't block
      if (err && !err.includes("มีบัญชีในระบบแล้ว")) {
        errors.push(`${label}: ${err}`);
      }
      emails.push(a.email.toLowerCase());
    });

    // Check for duplicate emails within the list
    const dupEmails = emails.filter((e, i) => emails.indexOf(e) !== i);
    if (dupEmails.length > 0) {
      errors.push(
        `มีอีเมลซ้ำกันในรายการ: ${[...new Set(dupEmails)].join(", ")}`,
      );
    }

    if (errors.length > 0) {
      toast.push(errors[0], "error");
      return;
    }

    try {
      setTicketAttendees(user.id, type.id, list);
      setSavedTypes((prev) => new Set([...prev, type.id]));
      toast.push(
        `เพิ่ม ${type.name} (${list.length} ที่นั่ง) ลงตะกร้าแล้ว`,
        "success",
      );
    } catch (err) {
      toast.push(err.message, "error");
    }
  };

  /** Remove a ticket type from cart */
  const handleRemove = (typeId) => {
    if (!user) return;
    try {
      removeTicketFromCart(user.id, typeId);
      setSavedTypes((prev) => {
        const n = new Set(prev);
        n.delete(typeId);
        return n;
      });
      toast.push("ลบรายการออกจากตะกร้าแล้ว", "success");
    } catch (err) {
      toast.push(err.message, "error");
    }
  };

  const activeType = types.find((t) => t.id === activeTypeId) || null;
  const activeList = activeType
    ? attendeesByType[activeType.id] || [
        {
          fullName: user?.fullName || "",
          faculty: user?.faculty || "",
          major: user?.major || "",
          enrollmentYearBE: user?.enrollmentYearBE
            ? String(user?.enrollmentYearBE)
            : "",
          email: user?.email || "",
          phone: user?.phone || "",
          isOwner: true,
        },
      ]
    : [];

  const isActiveSaved = activeType ? savedTypes.has(activeType.id) : false;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-10 space-y-8 animate-fade-in">
      {/* ─── Top Flow Stepper & Cart Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white border border-slate-200/90 p-3 sm:p-4 shadow-xs">
        {/* Step Progress Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold overflow-x-auto pb-1 sm:pb-0">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2 text-white shadow-sm shadow-brand-500/20 shrink-0">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-black text-brand-700">
              1
            </span>
            <span>เลือกบัตรเข้างาน</span>
          </div>

          <span className="text-slate-300 font-bold px-1">→</span>

          <Link
            to="/merchandise"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3.5 py-2 text-slate-600 hover:text-slate-900 transition shrink-0"
          >
            <Shirt className="h-3.5 w-3.5 text-slate-400" />
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600">
              2
            </span>
            <span>เสื้อที่ระลึก</span>
          </Link>

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

      {/* ─── Page Header ─── */}
      <PageHeader
        title="เลือกประเภทบัตรเข้างานเลี้ยงรุ่น"
        subtitle="บัตรทุกประเภทจะได้รับ QR Ticket ประจำตัวสำหรับสแกนเข้างาน พร้อมรับ Token โบนัสเข้ากระเป๋าดิจิทัลทันทีหลังการตรวจสอบชำระเงิน"
        icon={Ticket}
      />

      {/* ─── Empty state ─── */}
      {types.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 max-w-md mx-auto">
          <Ticket className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="font-bold text-slate-700">ยังไม่มีบัตรเปิดขายในขณะนี้</p>
          <p className="text-xs text-slate-400 mt-1">โปรดติดตามประกาศจากคณะกรรมการจัดงาน</p>
        </div>
      )}

      {/* ─── Ticket Tiers Grid ─── */}
      {types.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              รายการประเภทบัตรทั้งหมด ({types.length} ประเภท)
            </h2>
            <span className="text-xs text-brand-600 font-semibold flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> ซื้อได้สูงสุด 20 ที่นั่ง/ประเภท (ซื้อให้เพื่อนได้)
            </span>
          </div>

          <div
            className={`grid gap-6 ${
              types.length === 1
                ? "grid-cols-1 max-w-md mx-auto"
                : types.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-3"
            }`}
          >
            {types.map((type, idx) => {
              const remaining = type.stockLimit
                ? type.stockLimit - (type.soldCount || 0)
                : null;
              const isFeatured = idx === 0 || type.price >= 500;
              const isSelected = activeTypeId === type.id;
              const isSaved = savedTypes.has(type.id);
              const list = attendeesByType[type.id] || [];

              return (
                <div
                  key={type.id}
                  onClick={() => selectType(type.id)}
                  className={`group relative rounded-3xl bg-white border cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? "border-brand-600 ring-4 ring-brand-500/15 shadow-xl -translate-y-1"
                      : "border-slate-200/90 hover:border-brand-300 hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {/* Top Ribbon */}
                  {isFeatured && (
                    <div className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[11px] font-bold text-center py-1 tracking-wider uppercase flex items-center justify-center gap-1">
                      <Sparkles className="h-3 w-3" /> ยอดนิยม / แนะนำ
                    </div>
                  )}

                  <div className="p-6 space-y-4 flex-1">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                            isSelected
                              ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-600 group-hover:border-brand-300 group-hover:text-brand-600"
                          }`}
                        >
                          <Ticket className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                            {type.name}
                          </h3>
                          {remaining !== null && (
                            <span
                              className={`text-[11px] font-semibold ${
                                remaining <= 10 ? "text-rose-600 font-bold" : "text-slate-400"
                              }`}
                            >
                              เหลือ {remaining} ใบ
                            </span>
                          )}
                        </div>
                      </div>

                      {isSaved && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          ในตะกร้า ({list.length})
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="pt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">
                          {formatTHB(type.price)}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">/ ท่าน</span>
                      </div>
                    </div>

                    {/* Bonus Token Highlight Box */}
                    <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-3 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <Coins className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-amber-900 block leading-tight">
                          รับโบนัสฟรี {formatToken(type.bonusToken)}
                        </span>
                        <span className="text-[10px] text-amber-700/80">
                          เข้ากระเป๋า Token Wallet ทันที
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                      {type.description || "บัตรเข้าร่วมงานเลี้ยงรุ่นศิษย์เก่า รวมอาหาร เครื่องดื่ม และกิจกรรมตลอดทั้งงาน"}
                    </p>

                    {/* Features checklist */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>สิทธิ์เข้าร่วมงานเลี้ยงรุ่นศิษย์เก่า 2026</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>QR Ticket สำหรับสแกนเข้างานแยกรายบุคคล</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>รับโบนัส {type.bonusToken} Token ใช้จ่ายในงาน</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA Button */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectType(type.id);
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                        isSelected
                          ? "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20"
                          : isSaved
                          ? "bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>กำลังเลือกบัตรนี้ (ดูรายละเอียดด้านล่าง)</span>
                        </>
                      ) : isSaved ? (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span>แก้ไขรายชื่อ ({list.length} ที่นั่ง)</span>
                        </>
                      ) : (
                        <>
                          <span>เลือกซื้อบัตรนี้</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Attendee Details Workspace ─── */}
      {activeType && (
        <div
          id="attendee-workspace"
          className="rounded-3xl border-2 border-brand-200/80 bg-white p-6 sm:p-8 shadow-xl space-y-6 scroll-mt-6 animate-fade-in"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-bold text-brand-700">
                  <Ticket className="h-3.5 w-3.5 text-brand-600" />
                  <span>ประเภทบัตร: {activeType.name}</span>
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-bold text-slate-700">
                  {formatTHB(activeType.price)} / ที่นั่ง
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                ข้อมูลผู้เข้าร่วมงาน ({activeList.length} ที่นั่ง)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                กรอกรายชื่อผู้ที่จะเข้าร่วมงาน โดยระบบจะสร้าง QR Ticket แยกให้แต่ละคนตามข้อมูลด้านล่าง
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => addSlot(activeType.id)}
                disabled={activeList.length >= 20}
                className="btn-secondary text-xs gap-1.5 py-2.5 px-4 font-bold border-brand-200 bg-brand-50/50 hover:bg-brand-50 text-brand-700 transition"
              >
                <UserPlus className="h-4 w-4 text-brand-600" />
                <span>+ เพิ่มเพื่อน (+1 ที่นั่ง)</span>
              </button>
            </div>
          </div>

          {/* Attendee Slots List */}
          <div className="space-y-4">
            {activeList.map((a, i) =>
              i === 0 ? (
                /* Slot 1: Buyer Card */
                <BuyerSlotCard key="owner" user={user} attendee={a} />
              ) : (
                /* Slot 2..N: Friend Form */
                <FriendSlotCard
                  key={i}
                  index={i}
                  attendee={a}
                  onChange={(field, val) =>
                    updateField(activeType.id, i, field, val)
                  }
                  onRemove={() => removeSlot(activeType.id, i)}
                />
              )
            )}
          </div>

          {/* Info notice about friends' account password */}
          {activeList.length > 1 && (
            <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-4 flex items-start gap-3">
              <Key className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="block font-bold mb-0.5">
                  ระบบจะสร้างบัญชีให้เพื่อนอัตโนมัติ:
                </strong>
                เพื่อนแต่ละคนจะได้รับ QR Ticket ผ่านทางอีเมล และสามารถเข้าสู่ระบบด้วย{" "}
                <strong>เบอร์โทรศัพท์เป็นรหัสผ่านเริ่มต้น</strong>{" "}
                เพื่อดูบัตรและใช้ Token ในงานได้ทันที
              </div>
            </div>
          )}

          {/* Bottom Summary Bar & Save CTA */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  จำนวนที่นั่ง:
                </span>
                <span className="text-lg font-black text-slate-900">
                  {activeList.length} ที่นั่ง
                </span>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <span className="text-xs font-semibold text-slate-500 block">
                  Token โบนัสที่จะได้รับ:
                </span>
                <span className="text-lg font-black text-emerald-700 flex items-center gap-1">
                  <Coins className="h-4 w-4 text-emerald-600" />
                  +{formatToken(activeType.bonusToken * activeList.length)}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <span className="text-xs font-semibold text-slate-500 block">
                  ยอดรวมประเภทนี้:
                </span>
                <span className="text-2xl font-black text-brand-700">
                  {formatTHB(activeType.price * activeList.length)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isActiveSaved && (
                <button
                  type="button"
                  onClick={() => handleRemove(activeType.id)}
                  className="btn-secondary text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-300 py-3 px-4 font-bold"
                  title="ลบประเภทบัตรนี้ออกจากตะกร้า"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>ลบออกจากตะกร้า</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSave(activeType)}
                className="btn-primary text-sm font-extrabold py-3 px-6 gap-2 shadow-lg shadow-brand-500/25 transition-all"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>
                  {isActiveSaved
                    ? "บันทึกการเปลี่ยนแปลง"
                    : `เพิ่มลงตะกร้า (${activeList.length} ที่นั่ง · ${formatTHB(
                        activeType.price * activeList.length
                      )})`}
                </span>
              </button>
            </div>
          </div>

          {/* Quick links to proceed */}
          {cartCount > 0 && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                มีสินค้าในตะกร้าแล้ว ({cartCount} รายการ)
              </span>
              <div className="flex items-center gap-3">
                <Link
                  to="/merchandise"
                  className="text-brand-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Shirt className="h-3.5 w-3.5" />
                  <span>ไปเลือกซื้อเสื้อที่ระลึกต่อ →</span>
                </Link>
                <span className="text-slate-300">·</span>
                <Link
                  to="/checkout"
                  className="text-slate-800 font-bold hover:underline flex items-center gap-1"
                >
                  <span>ไปที่หน้าชำระเงิน →</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Terms & Notice ─── */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 text-xs text-slate-600 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-semibold text-slate-800">
            ข้อกำหนดและเงื่อนไขการซื้อบัตรเข้างาน:
          </strong>
          <p className="leading-relaxed">
            บัตรที่ชำระเงินเรียบร้อยแล้วไม่สามารถยกเลิก ขอคืนเงิน หรือแลกเปลี่ยนเป็นเงินสดได้ หากท่านซื้อบัตรให้เพื่อน
            ระบบจะสร้างบัญชีผู้ใช้ให้เพื่อนโดยอัตโนมัติ และ QR Ticket ประจำตัวจะถูกเชื่อมโยงกับบัญชีของเพื่อนแต่ละคนเพื่อใช้สแกนเข้างาน
          </p>
        </div>
      </div>
    </div>
  );
}

/** ─── Buyer Slot Card: Clean verified profile view (No redundant disabled inputs) ─── */
function BuyerSlotCard({ user }) {
  return (
    <div className="rounded-2xl border border-brand-200/90 bg-brand-50/30 p-4 sm:p-5 transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-brand-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white font-black text-xs shadow-xs">
            1
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">
              ที่นั่งที่ 1: คุณ (ผู้ซื้อบัตร)
            </h4>
            <p className="text-[11px] text-slate-500">
              ใช้ข้อมูลบัญชีที่เข้าสู่ระบบปัจจุบัน
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
          <span>บัญชีของคุณ (ดึงข้อมูลอัตโนมัติ)</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl bg-white border border-slate-200/80 p-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            ชื่อ-นามสกุล
          </span>
          <span className="font-bold text-slate-800 block truncate">
            {user?.fullName || "-"}
          </span>
        </div>

        <div className="rounded-xl bg-white border border-slate-200/80 p-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            รุ่น / คณะ
          </span>
          <span className="font-bold text-slate-800 block truncate">
            {user?.enrollmentYearBE ? `พ.ศ. ${user.enrollmentYearBE}` : "-"}{" "}
            {user?.faculty ? `· ${user.faculty}` : ""}
          </span>
        </div>

        <div className="rounded-xl bg-white border border-slate-200/80 p-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            เบอร์โทรศัพท์
          </span>
          <span className="font-bold text-slate-800 block truncate font-mono">
            {user?.phone || "-"}
          </span>
        </div>

        <div className="rounded-xl bg-white border border-slate-200/80 p-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            อีเมล
          </span>
          <span className="font-bold text-slate-800 block truncate font-mono">
            {user?.email || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

/** ─── Friend Slot Card: Form for additional attendees ─── */
function FriendSlotCard({ index, attendee, onChange, onRemove }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition hover:border-brand-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-black text-xs">
            {index + 1}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              ที่นั่งที่ {index + 1}: เพื่อนคนที่ {index}
            </h4>
            <p className="text-[11px] text-slate-400">
              กรอกข้อมูลเพื่อสร้าง QR Ticket และบัญชีสำหรับเพื่อน
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-xl text-xs font-semibold transition"
          title="ลบเพื่อนคนนี้"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>ลบ</span>
        </button>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="sm:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            ชื่อ-นามสกุล <span className="text-rose-500">*</span>
          </label>
          <input
            className="input text-xs w-full"
            placeholder="เช่น สมชาย ใจดี"
            value={attendee.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            คณะ <span className="text-rose-500">*</span>
          </label>
          <select
            className="input text-xs w-full"
            value={attendee.faculty}
            onChange={(e) => {
              const fac = e.target.value;
              onChange("faculty", fac);
              const majors = getMajorsByFaculty(fac);
              if (!majors.includes(attendee.major)) {
                onChange("major", "");
              }
            }}
          >
            <option value="">-- เลือกคณะ --</option>
            {FACULTIES.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            สาขาวิชา <span className="text-rose-500">*</span>
          </label>
          <select
            className="input text-xs w-full"
            value={attendee.major}
            onChange={(e) => onChange("major", e.target.value)}
            disabled={!attendee.faculty}
          >
            <option value="">
              {attendee.faculty ? "-- เลือกสาขาวิชา --" : "-- เลือกคณะก่อน --"}
            </option>
            {getMajorsByFaculty(attendee.faculty).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            พ.ศ. ที่เข้าเรียน <span className="text-rose-500">*</span>
          </label>
          <input
            className="input text-xs w-full"
            placeholder="เช่น 2555"
            value={attendee.enrollmentYearBE}
            onChange={(e) => {
              const val = e.target.value.slice(0, 9);
              onChange("enrollmentYearBE", val);
            }}
            onInput={(e) => {
              if (e.target.value.length > 9) e.target.value = e.target.value.slice(0, 9);
            }}
            type="number"
            min="2400"
            max="2600"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            เบอร์โทรศัพท์ <span className="text-rose-500">*</span>{" "}
            <span className="text-slate-400 font-normal">(รหัสผ่านเริ่มต้น)</span>
          </label>
          <input
            className="input text-xs w-full font-mono"
            placeholder="เช่น 0812345678"
            value={attendee.phone}
            onChange={(e) => onChange("phone", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            อีเมล <span className="text-rose-500">*</span>{" "}
            <span className="text-slate-400 font-normal">(สำหรับจัดส่ง QR Ticket)</span>
          </label>
          <input
            className="input text-xs w-full font-mono"
            placeholder="เช่น friend@example.com"
            type="email"
            value={attendee.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
