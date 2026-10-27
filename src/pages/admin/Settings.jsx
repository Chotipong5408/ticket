import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { settingsRepo, emailRepo } from '../../repositories'
import { saveSettings } from '../../services/catalogService'
import { resetDemoData, exportAll, importAll } from '../../services/demoService'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'

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
      toast.push('บันทึกตั้งค่าแล้ว', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  return (
    <div>
      <PageHeader title="ตั้งค่าระบบ Demo" subtitle="ข้อมูลถูกเก็บใน Browser ของเครื่องนี้เท่านั้น" />
      <div className="card max-w-xl space-y-3">
        <label className="label">ชื่องาน</label>
        <input className="input" value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} />
        <label className="label">URL เว็บไซต์งาน</label>
        <input className="input" value={form.siteUrl} onChange={(e) => setForm({ ...form, siteUrl: e.target.value })} />
        <label className="label">ค่าจัดส่ง</label>
        <input className="input" type="number" value={form.shippingFee} onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })} />
        <label className="label">นโยบาย Re-entry</label>
        <select className="input" value={form.reentryPolicy} onChange={(e) => setForm({ ...form, reentryPolicy: e.target.value })}>
          <option value="deny">ไม่อนุญาตเข้าซ้ำอัตโนมัติ</option>
          <option value="allow_admin">Super Admin อนุมัติเป็นกรณี</option>
        </select>
        <button className="btn-primary" type="button" onClick={save}>บันทึก</button>
      </div>
      <div className="card mt-4 space-y-3">
        <h2 className="font-semibold">Email Outbox (Preview)</h2>
        {emailRepo.all().map((e) => <pre key={e.id} className="whitespace-pre-wrap rounded bg-slate-50 p-3 text-xs">{e.to} · {e.subject}\n{e.body}</pre>)}
      </div>
      <div className="card mt-4 flex flex-wrap gap-2">
        <button className="btn-secondary" type="button" onClick={exportAll}>Export Demo JSON</button>
        <label className="btn-secondary cursor-pointer">
          Import Demo JSON
          <input type="file" accept="application/json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { await importAll(f); toast.push('นำเข้าแล้ว', 'success') } }} />
        </label>
        <button className="btn-danger" type="button" onClick={() => setResetOpen(true)}>Reset Demo Data</button>
      </div>
      <ConfirmDialog
        open={resetOpen}
        danger
        title="ล้างข้อมูลทดสอบ"
        message="จะลบ LocalStorage และภาพสลิปใน IndexedDB แล้วใส่ Seed ใหม่"
        confirmLabel="ล้างและ Seed ใหม่"
        onClose={() => setResetOpen(false)}
        onConfirm={async () => { await resetDemoData(); setResetOpen(false); toast.push('รีเซ็ตแล้ว', 'success') }}
      />
    </div>
  )
}
