import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { QrScanner } from "../../components/QrScanner";
import { usersRepo, settingsRepo, ticketsRepo } from "../../repositories";
import { walletSummary, topupTokens } from "../../services/tokenService";
import { decodeQr } from "../../lib/qr";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatToken } from "../../lib/money";
import { useLiveData } from "../../hooks/useLiveData";
import {
  CircleDollarSign,
  Search,
  User,
  CheckCircle2,
  ScanLine,
  UserCheck,
} from "lucide-react";

export default function TokenTopup() {
  useLiveData();
  const { user } = useAuth();
  const toast = useToast();
  const settings = settingsRepo.get();
  const [searchParams] = useSearchParams();

  const [q, setQ] = useState("");
  const [target, setTarget] = useState(() => {
    const uid = searchParams.get("userId");
    return uid ? usersRepo.findById(uid) : null;
  });
  const [tokens, setTokens] = useState(10);
  const [cash, setCash] = useState(settings.tokenPriceTHB * 10);

  function resolveUser(raw) {
    if (!raw) return;
    const str = String(raw).trim();
    const decoded = decodeQr(str);
    let found = null;

    if (decoded?.type === "user") {
      found = usersRepo.findById(decoded.token);
    } else if (decoded?.type === "ticket") {
      const ticket = ticketsRepo.findByQr(decoded.token);
      if (ticket) found = usersRepo.findById(ticket.buyerId);
    } else {
      found =
        usersRepo.findById(str) ||
        usersRepo.findByEmail(str) ||
        usersRepo
          .all()
          .find(
            (u) =>
              u.phone === str ||
              u.fullName.toLowerCase().includes(str.toLowerCase()),
          );
    }

    if (!found) {
      toast.push("ไม่พบผู้ใช้จาก QR หรือข้อมูลที่ระบุ", "error");
    } else {
      setTarget(found);
      toast.push(`พบผู้ใช้: ${found.fullName}`, "success");
    }
  }

  function confirm() {
    if (!target) return;
    try {
      topupTokens(user, {
        userId: target.id,
        tokens: Number(tokens),
        cashReceived: cash,
        note: `รับเงินสด ${cash} บาท โดย ${user.fullName}`,
      });
      toast.push(
        `เติม ${formatToken(tokens)} Token ให้ ${target.fullName} สำเร็จแล้ว`,
        "success",
      );
      // Refresh target wallet balance
      setTarget(usersRepo.findById(target.id));
    } catch (e) {
      toast.push(e.message, "error");
    }
  }

  const wallet = target ? walletSummary(target.id) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="บริการเติมเงิน Token (Top-up)"
        subtitle="สแกน QR Code ประจำตัวผู้ใช้ หรือค้นหาด้วยเบอร์โทร/อีเมล เพื่อรับเงินสดและเติม Token"
        icon={CircleDollarSign}
      />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Left Column: QR Scanner & User Search */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ScanLine className="h-4 w-4 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-800">
              กล้องสแกน QR ผู้ใช้
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            สามารถสแกนได้ทั้ง <strong>QR กระเป๋าเงิน</strong> และ{" "}
            <strong>QR Ticket</strong> ของลูกค้า
          </p>

          <QrScanner onResult={resolveUser} />

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-xs font-semibold text-slate-600 block">
              หรือระบุเบอร์โทร / อีเมล / ชื่อ / User ID
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  className="input pl-10 text-xs"
                  placeholder="เช่น 0812345678, user@example.com หรือชื่อ..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") resolveUser(q);
                  }}
                />
              </div>
              <button
                className="btn-primary text-xs px-5 py-2 font-bold whitespace-nowrap"
                type="button"
                onClick={() => resolveUser(q)}
              >
                ค้นหา
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Target User Details & Topup Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserCheck className="h-5 w-5 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-800">
              ข้อมูลผู้รับ Token & แพ็กเกจ
            </h3>
          </div>

          {!target || !wallet ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <User className="mx-auto h-12 w-12 text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-600">
                ยังไม่ได้ระบุผู้รับ Token
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                กรุณาสแกน QR ของผู้ใช้จากกล้องด้านซ้าย
                หรือพิมพ์ค้นหาด้วยเบอร์โทร/อีเมล
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* User badge */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-base shadow-sm">
                    {target.fullName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">
                      {target.fullName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {target.phone || target.email}{" "}
                      {target.enrollmentYearBE
                        ? `· พ.ศ. ${target.enrollmentYearBE}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400">
                    คงเหลือปัจจุบัน
                  </span>
                  <p className="text-xl font-black text-amber-700">
                    {formatToken(wallet.balance)}
                  </p>
                </div>
              </div>

              {/* Amount Form */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    จำนวน Token ที่เติม
                  </label>
                  <input
                    className="input text-xs font-bold"
                    type="number"
                    min="1"
                    max="999999999"
                    value={tokens}
                    onInput={(e) => {
                      if (e.target.value.length > 9) e.target.value = e.target.value.slice(0, 9);
                    }}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 9);
                      setTokens(v);
                      setCash(v === '' ? '' : Number(v) * settings.tokenPriceTHB);
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    ยอดเงินสดที่ต้องเรียกเก็บ
                  </label>
                  <div className="relative">
                    <input
                      className="input pr-12 text-xs font-bold text-emerald-700"
                      type="number"
                      min="0"
                      max="999999999"
                      value={cash}
                      onInput={(e) => {
                        if (e.target.value.length > 9) e.target.value = e.target.value.slice(0, 9);
                      }}
                      onChange={(e) => {
                        const v = e.target.value.slice(0, 9);
                        setCash(v === '' ? '' : Number(v));
                      }}
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                      บาท
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance projection */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  ยอดคงเหลือหลังการเติมเงิน:
                </span>
                <span className="font-black text-slate-900 text-sm">
                  {formatToken(wallet.balance + (Number(tokens) || 0))}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  className="btn-success flex-1 py-3.5 text-xs font-bold gap-2 shadow-md"
                  type="button"
                  onClick={confirm}
                >
                  <CheckCircle2 className="h-4 w-4" /> ยืนยันรับเงินสด {cash}{" "}
                  บาท และเติม {formatToken(tokens)} Token
                </button>
                <button
                  type="button"
                  className="btn-secondary text-xs px-4"
                  onClick={() => {
                    setTarget(null);
                    setQ("");
                  }}
                >
                  เปลี่ยนคน
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
