import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { merchRepo } from '../../repositories'
import { saveMerchandise } from '../../services/catalogService'
import { exportMerchandiseCsv } from '../../services/reportService'
import { formatTHB } from '../../lib/money'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { Modal } from '../../components/ui/Modal'
import { ShirtArt } from '../../components/ShirtArt'
import { Shirt, Plus, Download, Edit3 } from 'lucide-react'

export default function AdminMerchandise() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const items = merchRepo.all()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({})

  function save() {
    try {
      saveMerchandise(user, form, form.id)
      toast.push('บันทึกข้อมูลเสื้อเรียบร้อยแล้ว', 'success')
      setOpen(false)
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  const handleExport = () => {
    try {
      exportMerchandiseCsv(user)
      toast.push('ส่งออกข้อมูลรายงานเสื้อเป็น CSV สำเร็จ', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการเสื้อที่ระลึก & สินค้า"
        subtitle="ตั้งค่ารายการเสื้อ ราคา ขนาด และเปิด/ปิดการสั่งซื้อ"
        icon={Shirt}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs gap-1.5" type="button" onClick={handleExport}>
              <Download className="h-4 w-4" /> ส่งออก CSV
            </button>
            <button
              className="btn-primary text-xs gap-1.5"
              type="button"
              onClick={() => {
                setForm({ name: '', description: '', price: 0, isActive: true, stockEnabled: false, sizes: ['S', 'M', 'L', 'XL', '2XL'] })
                setOpen(true)
              }}
            >
              <Plus className="h-4 w-4" /> เพิ่มสินค้าใหม่
            </button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {items.map((p) => (
          <div
            key={p.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {p.isActive ? 'เปิดขาย' : 'ปิดการขาย'}
                </span>
                <span className="text-xl font-extrabold text-brand-700">{formatTHB(p.price)}</span>
              </div>

              <div className="mb-4">
                <ShirtArt kind={p.imageKind} />
              </div>

              <h2 className="text-base font-bold text-slate-800">{p.name}</h2>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>

              <div className="mt-3 flex flex-wrap gap-1">
                {(p.sizes || []).map((s) => (
                  <span key={s} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {s} {p.stockEnabled ? `(${p.stockBySize?.[s] ?? 0})` : ''}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100">
              <button
                className="btn-secondary w-full text-xs py-2 gap-1.5"
                type="button"
                onClick={() => {
                  setForm(p)
                  setOpen(true)
                }}
              >
                <Edit3 className="h-3.5 w-3.5" /> แก้ไขข้อมูลสินค้า
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        title={form.id ? 'แก้ไขข้อมูลเสื้อ' : 'เพิ่มสินค้าใหม่'}
        onClose={() => setOpen(false)}
        footer={
          <button className="btn-primary text-xs px-6 py-2" onClick={save}>
            บันทึกสินค้า
          </button>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="label">ชื่อสินค้า</label>
            <input
              className="input"
              placeholder="เช่น เสื้อโปโลศิษย์เก่า 2026"
              value={form.name ?? ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">ราคา (บาท)</label>
            <input
              className="input"
              type="number"
              min="0"
              max="999999999"
              placeholder="350"
              value={form.price ?? ''}
              onChange={(e) => {
                const val = e.target.value.slice(0, 9);
                setForm({ ...form, price: val === '' ? '' : Math.max(0, Number(val)) });
              }}
              onInput={(e) => {
                if (e.target.value.length > 9) e.target.value = e.target.value.slice(0, 9);
              }}
            />
          </div>

          <div>
            <label className="label">คำอธิบาย</label>
            <textarea
              className="input"
              rows={2}
              placeholder="รายละเอียดเนื้อผ้า สี ลายสกรีน"
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              className="rounded text-brand-600"
              checked={!!form.stockEnabled}
              onChange={(e) => setForm({ ...form, stockEnabled: e.target.checked })}
            />
            <span>จำกัดและแสดงจำนวนสต็อกตามขนาด (Stock by Size)</span>
          </label>

          {form.stockEnabled && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block">จำนวนสต็อกแต่ละไซส์</span>
              <div className="grid grid-cols-3 gap-2">
                {(form.sizes || ['S', 'M', 'L', 'XL', '2XL', '3XL']).map((sz) => (
                  <div key={sz}>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">ไซส์ {sz}</label>
                    <input
                      type="number"
                      min="0"
                      max="999999999"
                      className="input text-xs py-1"
                      value={form.stockBySize?.[sz] ?? 0}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 9);
                        setForm({
                          ...form,
                          stockBySize: {
                            ...(form.stockBySize || {}),
                            [sz]: Math.min(999999999, Math.max(0, parseInt(val, 10) || 0)),
                          },
                        });
                      }}
                      onInput={(e) => {
                        if (e.target.value.length > 9) e.target.value = e.target.value.slice(0, 9);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              className="rounded text-brand-600"
              checked={!!form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span>เปิดจำหน่ายสินค้านี้บนหน้าเว็บไซต์</span>
          </label>
        </div>
      </Modal>
    </div>
  )
}
