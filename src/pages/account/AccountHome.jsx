import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { walletSummary } from '../../services/tokenService'
import { ordersRepo, ticketsRepo } from '../../repositories'
import { formatToken } from '../../lib/money'
import { useLiveData } from '../../hooks/useLiveData'

export default function AccountHome() {
  useLiveData()
  const { user } = useAuth()
  const wallet = walletSummary(user.id)
  const orders = ordersRepo.byBuyer(user.id)
  const tickets = ticketsRepo.byBuyer(user.id)
  return (
    <div>
      <PageHeader title="บัญชีของฉัน" subtitle="ข้อมูลสถานะอ่านจากระบบ ไม่สามารถแก้ Token หรือสถานะชำระเงินเองได้" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-500">Token คงเหลือ</p><p className="text-2xl font-bold">{formatToken(wallet.balance)}</p></div>
        <div className="card"><p className="text-sm text-slate-500">คำสั่งซื้อ</p><p className="text-2xl font-bold">{orders.length}</p></div>
        <div className="card"><p className="text-sm text-slate-500">บัตรที่ออกแล้ว</p><p className="text-2xl font-bold">{tickets.filter((t) => t.status === 'issued' || t.status === 'used').length}</p></div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {[
          ['/account/profile', 'ข้อมูลส่วนตัว'],
          ['/account/orders', 'คำสั่งซื้อและสลิป'],
          ['/account/tickets', 'QR Ticket'],
          ['/account/wallet', 'Wallet'],
          ['/account/transactions', 'ประวัติ Token'],
          ['/account/merchandise', 'คำสั่งซื้อเสื้อ'],
        ].map(([to, label]) => <Link key={to} to={to} className="card">{label}</Link>)}
      </div>
    </div>
  )
}
