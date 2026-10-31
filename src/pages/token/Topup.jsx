import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { usersRepo, settingsRepo } from '../../repositories'
import { walletSummary, topupTokens } from '../../services/tokenService'
import { decodeQr } from '../../lib/qr'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatToken, formatTHB } from '../../lib/money'
import { useLiveData } from '../../hooks/useLiveData'
import { CircleDollarSign, Search, Coins, User, CheckCircle2, Wallet, ArrowRight, Package } from 'lucide-react'

export default function TokenTopup() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const settings = settingsRepo.get()
  const [q, setQ] = useState('')
  const [target, setTarget] = useState(null)
  const [tokens, setTokens] = useState(10)
  const [cash, setCash] = useState(settings.tokenPriceTHB * 10)

  function find() {
    if (!q.trim()) return
    const decoded = decodeQr(q.trim())
    const found =
      decoded?.type === 'user'
        ? usersRepo.findById(decoded.token)
        : usersRepo.findByEmail(q.trim()) ||
          usersRepo.all().find((u) => u.fullName.includes(q.trim()) || u.id === q.trim() || u.phone === q.trim())

    if (!found) {
      toast.push('ไม่พบผู้ใช้จากข้อมูลที่ระบุ', 'error')
    } else {
      setTarget(found)
      toast.push(`พบผู้ใช้: ${found.fullName}`, 'success')
    }
  }

  function applyPkg(p) {
    setTokens(p.tokens)
    setCash(p.price)
  }

  function confirm() {
    if (!target) return
    try {
      topupTokens(user, {
        userId: target.id,
        tokens: Number(tokens),
        cashReceived: cash,
        note: `รับเงินสด ${cash} บาท โดย ${user.fullName}`,
      })
      toast.push(`เติม ${formatToken(tokens)} Token ให้ ${target.fullName} สำเร็จแล้ว`, 'success')
      // Refresh target wallet balance
      setTarget(usersRepo.findById(target.id))
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  const wallet = target ? walletSummary(target.id) : null

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="บริการเติมเงิน Token (Top-up)"
        subtitle="ค้นหาผู้เข้าร่วมงานเพื่อรับเงินสดและเติม Token เข้ากระเป๋าเงินดิจิทัล"
        icon={CircleDollarSign}
      />

      {/* User Search Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
          ระบุผู้รับ Token (อีเมล / ชื่อ / เบอร์โทร / User ID หรือสแกน QR)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="input pl-9 text-xs"
              placeholder="วางรหัส QR ผู้ใช้, อีเมล, ชื่อ-นามสกุล หรือเบอร์โทร..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') find()
              }}
            />
          </div>
          <button className="btn-primary text-xs px-6 py-2 font-bold" type="button" onClick={find}>
            ค้นหาผู้ใช้
          </button>
        </div>
      </div>

      {/* Target User Details and Topup Card */}
      {target && wallet && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
          {/* User badge */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-base shadow-sm">
                {target.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">{target.fullName}</h3>
                <p className="text-xs text-slate-400 font-mono">{target.email} · พ.ศ. {target.enrollmentYearBE || '-'}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400">คงเหลือปัจจุบัน</span>
              <p className="text-xl font-black text-amber-700">{formatToken(wallet.balance)} Token</p>
            </div>
          </div>

          {/* Quick Package Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
              เลือกแพ็กเกจเติมเงินสำเร็จรูป
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(settings.tokenPackages || []).map((p) => {
                const isSelected = Number(tokens) === p.tokens && Number(cash) === p.price
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPkg(p)}
                    className={`rounded-2xl border p-3 text-center transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 text-slate-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 hover:border-brand-300 text-slate-700'
                    }`}
                  >
                    <p className="font-black text-sm text-brand-700">{p.tokens} Token</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{p.price} บาท</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Amount Form */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                จำนวน Token ที่เติม
              </label>
              <input
                className="input text-xs font-bold"
                type="number"
                min="1"
                value={tokens}
                onChange={(e) => {
                  setTokens(e.target.value)
                  setCash(Number(e.target.value) * settings.tokenPriceTHB)
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
                  value={cash}
                  onChange={(e) => setCash(Number(e.target.value))}
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">บาท</span>
              </div>
            </div>
          </div>

          {/* Balance projection */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 flex items-center justify-between text-xs">
            <span className="text-slate-600">ยอดคงเหลือหลังการเติมเงิน:</span>
            <span className="font-black text-slate-900 text-sm">
              {formatToken(wallet.balance + (Number(tokens) || 0))} Token
            </span>
          </div>

          {/* Confirm Button */}
          <button
            className="btn-success w-full py-3.5 text-xs font-bold gap-2 shadow-md"
            type="button"
            onClick={confirm}
          >
            <CheckCircle2 className="h-4 w-4" /> ยืนยันรับเงินสด {cash} บาท และเติม {formatToken(tokens)} Token
          </button>
        </div>
      )}
    </div>
  )
}
