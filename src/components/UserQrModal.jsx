import { Modal } from './ui/Modal'
import { QrBox } from './QrBox'
import { encodeQr } from '../lib/qr'
import { formatToken, formatTHB } from '../lib/money'
import { walletSummary } from '../services/tokenService'
import { useLiveData } from '../hooks/useLiveData'
import { settingsRepo } from '../repositories'
import { Sparkles, Store, CircleDollarSign, Coins } from 'lucide-react'

export function UserQrModal({ open, onClose, user }) {
  useLiveData()
  if (!user) return null
  const w = walletSummary(user.id)
  const settings = settingsRepo.get() || {}
  const tokenRate = Number(settings.tokenPriceTHB) || 10

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="QR ประจำตัวสำหรับชำระเงินและเติม Token"
    >
      <div className="space-y-5 text-center">
        {/* User Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-950 p-4 text-white shadow-md">
          <p className="text-xs text-brand-300 font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" /> บัญชีศิษย์เก่า
          </p>
          <h3 className="text-lg font-extrabold">{user.fullName}</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            รุ่นปี พ.ศ. {user.enrollmentYearBE || '-'} · {user.faculty || '-'}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md px-3.5 py-1.5 border border-white/15">
              <span className="text-xs text-slate-300">ยอดคงเหลือ:</span>
              <span className="text-base font-black text-amber-300">
                {formatToken(w.balance)}
              </span>
              <span className="text-xs font-semibold text-emerald-300">
                ({formatTHB(w.balance * tokenRate)})
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-md px-3 py-1.5 border border-white/15 text-xs text-slate-200">
              <Coins className="h-3.5 w-3.5 text-amber-300" />
              <span>เรท: <strong>1 Token = {tokenRate} บาท</strong></span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <QrBox
            value={encodeQr('user', user.id)}
            label="User QR Code"
            caption="สแกนเพื่อตัด Token หรือเติมเงิน"
            size={220}
            downloadName={`user-qr-${user.id}.png`}
          />
        </div>

        {/* Usage Instructions */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left space-y-2 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <Store className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-slate-800">ชำระค่าอาหาร/สินค้า:</strong> ยื่น QR นี้ให้ร้านค้าในงานสแกนเพื่อตัด Token ตามยอดชำระ
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CircleDollarSign className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-slate-800">เติม Token เพิ่ม:</strong> แสดง QR นี้ให้เจ้าหน้าที่จุดบริการเติมเงิน (Event Admin)
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

