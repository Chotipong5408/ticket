import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { QrScanner } from '../../components/QrScanner'
import { decodeQr } from '../../lib/qr'
import { usersRepo, ticketsRepo } from '../../repositories'
import { walletSummary } from '../../services/tokenService'
import { formatToken } from '../../lib/money'
import { ScanLine, User, Wallet, Coins, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TokenScan() {
  const [user, setUser] = useState(null)

  function resolve(raw) {
    if (!raw) return
    const d = decodeQr(raw.trim())
    if (d?.type === 'user') {
      setUser(usersRepo.findById(d.token))
    } else if (d?.type === 'ticket') {
      const t = ticketsRepo.findByQr(d.token)
      setUser(t ? usersRepo.findById(t.buyerId) : null)
    } else {
      setUser(usersRepo.findById(raw.trim()))
    }
  }

  const w = user ? walletSummary(user.id) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="สแกนตรวจสอบ Token ของผู้ใช้"
        subtitle="ใช้กล้องสแกน QR Code ประจำตัว หรือ QR Ticket ของผู้เข้าร่วมงานเพื่อตรวจดูยอดเงินคงเหลือ"
        icon={ScanLine}
      />

      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Scanner Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ScanLine className="h-4 w-4 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-800">กล้องสแกน QR</h3>
          </div>
          <QrScanner onResult={resolve} />
        </div>

        {/* User Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <User className="h-4 w-4 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-800">ข้อมูลบัญชีผู้ใช้งาน</h3>
          </div>

          {!user ? (
            <div className="py-14 text-center text-slate-400 space-y-2">
              <User className="mx-auto h-12 w-12 text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-medium">รอการสแกน QR</p>
              <p className="text-[11px] text-slate-400">นำ QR ประจำตัวของผู้ใช้มาสแกนเพื่อตรวจสอบยอดคงเหลือ</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-base shadow-sm">
                  {user.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{user.fullName}</h4>
                  <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-5 space-y-1">
                <span className="text-xs text-amber-800 font-semibold">ยอด Token คงเหลือในกระเป๋า</span>
                <p className="text-3xl font-black text-amber-900">{formatToken(w?.balance || 0)} Token</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-slate-400 text-[10px]">โบนัส</span>
                  <p className="font-bold text-emerald-700 mt-0.5">{formatToken(w?.bonus || 0)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-slate-400 text-[10px]">เติมเพิ่ม</span>
                  <p className="font-bold text-blue-700 mt-0.5">{formatToken(w?.topup || 0)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-slate-400 text-[10px]">ใช้ไป</span>
                  <p className="font-bold text-slate-700 mt-0.5">{formatToken(w?.spent || 0)}</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/token-admin/topup"
                  className="btn-primary w-full py-2.5 text-xs font-bold gap-2 text-center flex items-center justify-center"
                >
                  <Coins className="h-4 w-4" /> ไปหน้าเติม Token ให้ผู้ใช้นี้
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
