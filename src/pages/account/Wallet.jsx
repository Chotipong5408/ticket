import { PageHeader } from '../../components/ui/PageHeader'
import { QrBox } from '../../components/QrBox'
import { useAuth } from '../../context/AuthContext'
import { walletSummary } from '../../services/tokenService'
import { formatToken } from '../../lib/money'
import { encodeQr } from '../../lib/qr'
import { useLiveData } from '../../hooks/useLiveData'

export default function Wallet() {
  useLiveData()
  const { user } = useAuth()
  const w = walletSummary(user.id)
  return (
    <div>
      <PageHeader title="Token Wallet" subtitle="Token แลกเงินสดคืนไม่ได้ ผู้ใช้แก้ยอดเองไม่ได้" />
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card"><p className="text-sm text-slate-500">คงเหลือ</p><p className="text-xl font-bold">{formatToken(w.balance)}</p></div>
        <div className="card"><p className="text-sm text-slate-500">โบนัส</p><p className="text-xl font-bold">{formatToken(w.bonus)}</p></div>
        <div className="card"><p className="text-sm text-slate-500">เติมเพิ่ม</p><p className="text-xl font-bold">{formatToken(w.topup)}</p></div>
        <div className="card"><p className="text-sm text-slate-500">ใช้ไป</p><p className="text-xl font-bold">{formatToken(w.spent)}</p></div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <QrBox value={encodeQr('user', user.id)} label="QR ผู้ใช้สำหรับเติม Token" caption="ให้ Token Admin สแกนเพื่อเติม" />
        <div className="card text-sm text-slate-600">
          ยอดคงเหลือคำนวณจากรายการธุรกรรมทั้งหมด หากไม่ตรงกับตัวเลขที่แสดง แสดงว่าระบบมีข้อผิดพลาดด้านบัญชี
        </div>
      </div>
    </div>
  )
}
