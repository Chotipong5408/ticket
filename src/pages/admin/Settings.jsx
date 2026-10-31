import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { settingsRepo, emailRepo } from '../../repositories'
import { saveSettings } from '../../services/catalogService'
import { resetDemoData, exportAll, importAll } from '../../services/demoService'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { Settings, Save, Mail, Download, Upload, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function AdminSettings() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const s = settingsRepo.get()
  const [form, setForm] = useState(s)
  const [resetOpen, setResetOpen] = useState(false)

  function save() {
    try {
      saveSettings(user, form)
      toast.push('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="ตั้งค่าระบบงานเลี้ยงรุ่น (Settings)"
        subtitle="กำหนดค่าชื่องาน นโยบาย Check-in ค่าจัดส่งพัสดุ และการสำรอง/คืนค่าข้อมูลทดสอบ"
        icon={Settings}
      />

      {/* Main Settings Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
          ข้อมูลพื้นฐานของงาน
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              ชื่องานเลี้ยงรุ่น
            </label>
            <input
              className="input text-xs"
              value={form.eventName || ''}
              onChange={(e) => setForm({ ...form, eventName: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              URL เว็บไซต์งาน
            </label>
            <input
              className="input text-xs"
              value={form.siteUrl || ''}
              onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              ค่าจัดส่งเสื้อที่ระลึก (บาท)
            </label>
            <input
              className="input text-xs"
              type="number"
              value={form.shippingFee ?? 0}
              onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              นโยบายการสแกนเข้างานซ้ำ (Re-entry Policy)
            </label>
            <select
              className="input text-xs"
              value={form.reentryPolicy || 'deny'}
              onChange={(e) => setForm({ ...form, reentryPolicy: e.target.value })}
            >
              <option value="deny">ไม่อนุญาตเข้าซ้ำอัตโนมัติ (Deny)</option>
              <option value="allow_admin">Super Admin อนุมัติเป็นรายกรณี (Allow by Admin)</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button className="btn-primary text-xs px-6 py-2.5 font-bold gap-2" type="button" onClick={save}>
            <Save className="h-4 w-4" /> บันทึกการตั้งค่า
          </button>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand-600" />
          <span>การจัดการข้อมูลทดสอบ (Demo Backup & Reset)</span>
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          ระบบ Demo นี้ทำงานบน Local Browser คุณสามารถสำรองข้อมูลทั้งหมดออกมาเป็นไฟล์ JSON หรือรีเซ็ตข้อมูลเริ่มต้น (Seed Data) ได้ตลอดเวลา
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <button className="btn-secondary text-xs gap-1.5" type="button" onClick={exportAll}>
            <Download className="h-4 w-4" /> Export ข้อมูล Demo (JSON)
          </button>

          <label className="btn-secondary text-xs gap-1.5 cursor-pointer">
            <Upload className="h-4 w-4" /> Import ข้อมูล Demo (JSON)
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f) {
                  await importAll(f)
                  toast.push('นำเข้าข้อมูลสำเร็จแล้ว', 'success')
                }
              }}
            />
          </label>

          <button className="btn-danger text-xs gap-1.5 ml-auto" type="button" onClick={() => setResetOpen(true)}>
            <RotateCcw className="h-4 w-4" /> ล้างข้อมูล & รีเซ็ต Seed Data
          </button>
        </div>
      </div>

      {/* Email Outbox (Preview) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Mail className="h-4 w-4 text-brand-600" />
          <span>ระบบจำลองส่งอีเมลแจ้งเตือน (Email Outbox Preview)</span>
        </h3>

        {emailRepo.all().length === 0 ? (
          <p className="text-xs text-slate-400 py-3">ยังไม่มีอีเมลใน Outbox</p>
        ) : (
          <div className="space-y-3">
            {emailRepo.all().map((e) => (
              <div key={e.id} className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-slate-700 font-bold border-b border-slate-200/60 pb-1.5">
                  <span>ส่งถึง: {e.to}</span>
                  <span className="text-slate-400 font-normal">{e.subject}</span>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-slate-600 text-xs leading-relaxed pt-1">
                  {e.body}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={resetOpen}
        danger
        title="ยืนยันการล้างข้อมูลทดสอบ (Reset Demo Data)"
        message="การดำเนินการนี้จะลบข้อมูล LocalStorage และภาพสลิปทั้งหมดใน IndexedDB แล้วแทนที่ด้วยชุดข้อมูลทดสอบเริ่มต้น (Seed) ยืนยันหรือไม่?"
        confirmLabel="ยืนยันล้างข้อมูลและ Seed ใหม่"
        onClose={() => setResetOpen(false)}
        onConfirm={async () => {
          await resetDemoData()
          setResetOpen(false)
          toast.push('รีเซ็ตข้อมูลและโหลด Seed ใหม่เรียบร้อยแล้ว', 'success')
        }}
      />
    </div>
  )
}
