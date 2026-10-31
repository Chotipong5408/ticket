import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { storesRepo, productsRepo } from '../../repositories'
import { storeReport } from '../../services/reportService'
import { formatToken } from '../../lib/money'
import { useLiveData } from '../../hooks/useLiveData'
import { Store, QrCode, ScanLine, ShoppingBag, Coins, CheckCircle2, ArrowRight, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function StoreDashboard() {
  useLiveData()
  const { user } = useAuth()
  const store = storesRepo.findById(user.storeId)
  const report = store ? storeReport(store.id) : { paid: 0, tokens: 0, requests: 0 }
  const product = store ? productsRepo.byStore(store.id)[0] : null

  if (!store) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center max-w-md mx-auto my-12">
        <Store className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <h2 className="text-base font-bold text-slate-800">บัญชียังไม่ได้รับการมอบหมายร้านค้า</h2>
        <p className="text-xs text-slate-400 mt-1">กรุณาแจ้ง Super Admin เพื่อกำหนดร้านค้าที่คุณรับผิดชอบ</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Store Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white border border-white/20 shadow-inner">
              <Store className="h-7 w-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{store.name}</h1>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-brand-200">
                  {store.category || 'ร้านค้า'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                ผู้จัดการร้าน: <span className="font-semibold text-white">{user.fullName}</span> · สินค้าหลัก:{' '}
                <span className="text-amber-300 font-bold">{product?.name || 'ยังไม่ระบุ'}</span> ({product?.priceToken || 0} Token)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/store/payment-requests"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-900 text-xs font-bold px-4 py-2.5 shadow transition"
            >
              <QrCode className="h-4 w-4" /> สร้าง QR รับชำระ
            </Link>
            <Link
              to="/store/scan-payment"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-2.5 border border-white/20 backdrop-blur-sm transition"
            >
              <ScanLine className="h-4 w-4" /> สแกนลูกค้า
            </Link>
          </div>
        </div>
      </div>

      <PageHeader
        title="สถิติภาพรวมร้านค้า"
        subtitle="ยอดขาย คำขอชำระเงิน และ Token สะสมจากการจำหน่ายอาหารและเครื่องดื่มในงาน"
        icon={ShoppingBag}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Revenue in Tokens */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Token ที่ได้รับทั้งหมด</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{formatToken(report.tokens)}</p>
            <p className="text-xs text-amber-600 font-medium mt-1">ยอดรวมความสำเร็จจากการขาย</p>
          </div>
        </div>

        {/* Paid orders count */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">จำนวนบิลที่สำเร็จ</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{report.paid} <span className="text-sm font-normal text-slate-400">บิล</span></p>
            <p className="text-xs text-emerald-600 font-medium mt-1">ลูกค้าชำระเงินเรียบร้อย</p>
          </div>
        </div>

        {/* Requests count */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">คำขอชำระทั้งหมด</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-200/60">
              <QrCode className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{report.requests} <span className="text-sm font-normal text-slate-400">ครั้ง</span></p>
            <p className="text-xs text-brand-600 font-medium mt-1">สร้างผ่าน QR & หน้าร้าน</p>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/store/product"
          className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">
                จัดการราคา & เมนูสินค้า
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">เปลี่ยนชื่อ ปรับราคา Token หรือเปิด/ปิดการจำหน่าย</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/store/reports"
          className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">
                รายงานการขายฉบับเต็ม
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">ดูบันทึกยอดขายรายชั่วโมงและประวัติการรับ Token</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  )
}
