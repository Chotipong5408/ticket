import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { settingsRepo } from '../../repositories'
import { saveSettings } from '../../services/catalogService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'

export default function TokenSettings() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const s = settingsRepo.get()
  const [price, setPrice] = useState(s.tokenPriceTHB)
  const [packages, setPackages] = useState(s.tokenPackages)
  function save() {
    try {
      saveSettings(user, { tokenPriceTHB: Number(price), tokenPackages: packages.map((p) => ({ ...p, tokens: Number(p.tokens), price: Number(p.price) })) })
      toast.push('บันทึกราคา Token แล้ว', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  return (
    <div>
      <PageHeader title="ราคา Token" />
      <div className="card max-w-lg space-y-3">
        <label className="label">ราคาต่อ 1 Token (บาท)</label>
        <input className="input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        {packages.map((p, i) => (
          <div key={p.id} className="grid grid-cols-2 gap-2">
            <input className="input" value={p.tokens} onChange={(e) => setPackages(packages.map((x, idx) => idx === i ? { ...x, tokens: e.target.value } : x))} />
            <input className="input" value={p.price} onChange={(e) => setPackages(packages.map((x, idx) => idx === i ? { ...x, price: e.target.value } : x))} />
          </div>
        ))}
        <button className="btn-primary" type="button" onClick={save}>บันทึก</button>
      </div>
    </div>
  )
}
