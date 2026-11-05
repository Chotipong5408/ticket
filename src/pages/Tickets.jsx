import { useNavigate } from "react-router-dom";
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
import {
  Ticket,
  ShoppingCart,
  Coins,
  AlertCircle,
  ArrowRight,
  Minus,
  Shirt,
  UserPlus,
  Users,
  Trash2,
  ChevronUp,
  CheckCircle2,
  Key,
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
   * openPanels: Set of ticketTypeId strings that are expanded
   */
  const [attendeesByType, setAttendeesByType] = useState({});
  const [openPanels, setOpenPanels] = useState(new Set());
  const [savedTypes, setSavedTypes] = useState(new Set()); // types already added to cart

  const cartCount = user ? quoteCart(user.id).items.length : 0;

  /** Toggle a type's panel open/closed, initialising with 1 owner slot on first open */
  const togglePanel = (typeId) => {
    if (!user) {
      nav("/login");
      return;
    }
    setOpenPanels((prev) => {
      const next = new Set(prev);
      if (next.has(typeId)) {
        next.delete(typeId);
      } else {
        next.add(typeId);
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
      }
      return next;
    });
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200/60 px-3.5 py-1 text-xs font-semibold text-brand-700 mb-3">
          <Ticket className="h-3.5 w-3.5" />
          <span>จำหน่ายบัตรเข้างานล่วงหน้า</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          เลือกประเภทบัตรเข้างาน
        </h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          บัตรทุกประเภทจะได้รับ QR Ticket หลังการตรวจสอบชำระเงิน และรับ Token
          โบนัสเข้ากระเป๋าสำหรับใช้จ่ายภายในงาน
        </p>
        <p className="text-xs text-brand-600 font-semibold mt-1">
          <Users className="inline h-3.5 w-3.5 mr-1" />
          สามารถซื้อบัตรให้เพื่อนได้ กรอกข้อมูลเพื่อนแต่ละคนในแบบฟอร์มด้านล่าง
        </p>

        {/* Dual Switcher: Tickets <-> Shirts */}
        <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-inner">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-extrabold text-brand-700 shadow-sm"
          >
            <Ticket className="h-4 w-4 text-brand-600" />
            <span>1. เลือกซื้อบัตรเข้างาน</span>
          </button>
          <button
            type="button"
            onClick={() => nav("/merchandise")}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <Shirt className="h-4 w-4 text-slate-400" />
            <span>2. สั่งซื้อเสื้อที่ระลึก →</span>
          </button>
        </div>
      </div>

      {types.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 max-w-md mx-auto">
          <Ticket className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="font-medium text-slate-700">
            ยังไม่มีบัตรเปิดขายในขณะนี้
          </p>
          <p className="text-xs text-slate-400 mt-1">
            โปรดติดตามประกาศจากคณะกรรมการจัดงาน
          </p>
        </div>
      )}

      {/* Ticket Cards */}
      <div className="space-y-6">
        {types.map((type, idx) => {
          const remaining = type.stockLimit
            ? type.stockLimit - (type.soldCount || 0)
            : null;
          const isFeatured = idx === 0;
          const isOpen = openPanels.has(type.id);
          const isSaved = savedTypes.has(type.id);
          const list = attendeesByType[type.id] || [];

          return (
            <div
              key={type.id}
              className={`relative rounded-3xl bg-white border transition-all duration-300 overflow-hidden ${
                isFeatured
                  ? "border-brand-500 ring-4 ring-brand-500/10 shadow-xl"
                  : "border-slate-200/80 hover:border-brand-300 shadow-sm hover:shadow-lg"
              }`}
            >
              {isFeatured && (
                <div className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[11px] font-bold text-center py-1.5 tracking-wide uppercase">
                  ⭐ ยอดนิยม / แนะนำ
                </div>
              )}

              {/* Card Summary Row */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${isFeatured ? "bg-brand-50 border-brand-200/60 text-brand-600" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                >
                  <Ticket className="h-6 w-6" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <h2 className="text-base font-bold text-slate-800">
                      {type.name}
                    </h2>
                    {remaining !== null && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          remaining <= 10
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        เหลือ {remaining} ใบ
                      </span>
                    )}
                    {isSaved && (
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> อยู่ในตะกร้า (
                        {list.length} ที่นั่ง)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {type.description}
                  </p>
                </div>

                {/* Price + Action */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-slate-900">
                      {formatTHB(type.price)}
                    </div>
                    <div className="text-[11px] text-slate-400">/ ท่าน</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSaved && (
                      <button
                        type="button"
                        onClick={() => handleRemove(type.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition"
                        title="ลบออกจากตะกร้า"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => togglePanel(type.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                        isOpen
                          ? "bg-slate-100 text-slate-700 border border-slate-200"
                          : isFeatured
                            ? "bg-brand-600 hover:bg-brand-700 text-white"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {isOpen ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" /> ซ่อน
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-3.5 w-3.5" />{" "}
                          {isSaved ? "แก้ไข" : "เลือกซื้อ"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bonus Token bar */}
              <div className="px-6 pb-4 -mt-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-xl px-2.5 py-1.5">
                  <Coins className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>
                    รับโบนัสฟรี {formatToken(type.bonusToken)} Token / ที่นั่ง
                  </span>
                </div>
              </div>

              {/* Expandable Attendee Panel */}
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-brand-600" />
                      <span className="text-sm font-bold text-slate-800">
                        รายชื่อผู้เข้าร่วมงาน
                      </span>
                      <span className="rounded-full bg-brand-100 text-brand-700 px-2 py-0.5 text-[11px] font-bold">
                        {list.length} ที่นั่ง
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => addSlot(type.id)}
                      disabled={list.length >= 20}
                      className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand-400 hover:text-brand-600 text-slate-600 text-xs font-semibold px-3.5 py-2 transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> เพิ่มเพื่อน
                    </button>
                  </div>

                  <div className="space-y-5">
                    {list.map((a, i) => (
                      <AttendeeForm
                        key={i}
                        index={i}
                        attendee={a}
                        isOwnerSlot={i === 0}
                        onChange={(field, val) =>
                          updateField(type.id, i, field, val)
                        }
                        onRemove={i > 0 ? () => removeSlot(type.id, i) : null}
                      />
                    ))}
                  </div>

                  {/* Info box about auto password */}
                  {list.some((a) => !a.isOwner) && (
                    <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200/80 p-4 flex items-start gap-3">
                      <Key className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <div className="text-xs text-amber-900 leading-relaxed">
                        <strong className="block font-semibold mb-0.5">
                          รหัสผ่านบัญชีของเพื่อน
                        </strong>
                        ระบบจะสร้างบัญชีผู้ใช้ให้เพื่อนอัตโนมัติ โดยใช้{" "}
                        <strong>เบอร์โทรศัพท์เป็นรหัสผ่านเริ่มต้น</strong>{" "}
                        กรุณาแจ้งเพื่อนให้เข้าสู่ระบบและเปลี่ยนรหัสผ่านใหม่ภายหลัง
                      </div>
                    </div>
                  )}

                  {/* Save to cart button */}
                  <button
                    type="button"
                    onClick={() => handleSave(type)}
                    className={`mt-5 w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                      isFeatured
                        ? "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isSaved
                      ? "บันทึกการเปลี่ยนแปลง"
                      : `เพิ่มลงตะกร้า (${list.length} ที่นั่ง · ${formatTHB(type.price * list.length)})`}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Checkout Banner */}
      {user && cartCount > 0 && (
        <div className="mt-10 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">
                มีสินค้าในตะกร้าเรียบร้อยแล้ว ({cartCount} รายการ)
              </p>
              <p className="text-xs text-white/80">
                ตรวจสอบรายการและชำระเงินเพื่อรอออกบัตร
              </p>
            </div>
          </div>
          <button
            onClick={() => nav("/checkout")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-700 font-bold px-6 py-2.5 text-xs hover:bg-brand-50 transition shadow"
          >
            ไปที่ตะกร้า / ชำระเงิน <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Terms & Notice */}
      <div className="mt-10 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-5 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-semibold">
            ข้อกำหนดและเงื่อนไขการซื้อบัตร:
          </strong>
          <p>
            บัตรที่ซื้อแล้วไม่สามารถยกเลิก ขอคืนเงิน
            หรือแลกเปลี่ยนเป็นเงินสดได้ในทุกกรณี หากท่านซื้อบัตรให้เพื่อน
            ระบบจะสร้างบัญชีผู้ใช้ให้เพื่อนโดยอัตโนมัติ และ QR Ticket
            จะถูกเชื่อมโยงกับบัญชีของเพื่อนแต่ละคน
          </p>
        </div>
      </div>
    </div>
  );
}

/** Sub-component: form for a single attendee slot */
function AttendeeForm({ index, attendee, isOwnerSlot, onChange, onRemove }) {
  return (
    <div
      className={`rounded-2xl border p-4 bg-white shadow-xs ${isOwnerSlot ? "border-brand-200" : "border-slate-200"}`}
    >
      {/* Slot header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold ${isOwnerSlot ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"}`}
          >
            {index + 1}
          </div>
          <span className="text-xs font-bold text-slate-700">
            {isOwnerSlot ? "👤 คุณ (ผู้ซื้อ)" : `🫂 เพื่อนคนที่ ${index}`}
          </span>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
            title="ลบผู้ร่วมงานคนนี้"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="sm:col-span-2">
          <input
            className="input text-xs w-full"
            placeholder="ชื่อ-นามสกุล *"
            value={attendee.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            readOnly={isOwnerSlot}
          />
        </div>
        {isOwnerSlot ? (
          <input
            className="input text-xs"
            placeholder="คณะ *"
            value={attendee.faculty}
            readOnly
          />
        ) : (
          <select
            className="input text-xs"
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
            <option value="">-- เลือกคณะ * --</option>
            {FACULTIES.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        )}
        {isOwnerSlot ? (
          <input
            className="input text-xs"
            placeholder="สาขา *"
            value={attendee.major}
            readOnly
          />
        ) : (
          <select
            className="input text-xs"
            value={attendee.major}
            onChange={(e) => onChange("major", e.target.value)}
            disabled={!attendee.faculty}
          >
            <option value="">
              {attendee.faculty ? "-- เลือกสาขา * --" : "-- เลือกคณะก่อน --"}
            </option>
            {getMajorsByFaculty(attendee.faculty).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
        <input
          className="input text-xs"
          placeholder="ปี พ.ศ. ที่เข้าเรียน (เช่น 2560) *"
          value={attendee.enrollmentYearBE}
          onChange={(e) => onChange("enrollmentYearBE", e.target.value)}
          type="number"
          min="2400"
          max="2600"
          readOnly={isOwnerSlot}
        />
        <input
          className="input text-xs"
          placeholder="เบอร์โทรศัพท์ * (ใช้เป็นรหัสผ่านเริ่มต้น)"
          value={attendee.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          readOnly={isOwnerSlot}
        />
        <div className="sm:col-span-2">
          <input
            className="input text-xs w-full"
            placeholder="อีเมล *"
            type="email"
            value={attendee.email}
            onChange={(e) => onChange("email", e.target.value)}
            readOnly={isOwnerSlot}
          />
        </div>
      </div>
      {isOwnerSlot && (
        <p className="text-[11px] text-slate-400 mt-2">
          ข้อมูลของคุณดึงจากโปรไฟล์บัญชี (ไม่สามารถแก้ไขได้ที่นี่)
        </p>
      )}
    </div>
  );
}
