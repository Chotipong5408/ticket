import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { usersRepo, settingsRepo } from '../../repositories'
import { walletSummary, topupTokens } from '../../services/tokenService'
import { decodeQr } from '../../lib/qr'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatToken } from '../../lib/money'
import { useLiveData } from '../../hooks/useLiveData'

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
    const decoded = decodeQr(q)
    const found = decoded?.type === 'user' ? usersRepo.findById(decoded.token) : usersRepo.findByEmail(q) || usersRepo.all().find((u) => u.fullName.includes(q) || u.id === q)
    if (!found) toast.push('ไม่พบผู้ใช้', 'error')
    else setTarget(found)
  }
  function applyPkg(p) {
    setTokens(p.tokens)
    setCash(p.price)
  }
  function confirm() {
    try {
      topupTokens(user, { userId: target.id, tokens: Number(tokens), cashReceived: cash, note: `รับชำระ ${cash} บาท` })
      toast.push('เติม Token แล้ว', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  const wallet = target ? walletSummary(target.id) : null
  return (
    <div>
      <PageHeader title="เติม Token" subtitle="ต้องมีธุรกรรมอ้างอิง ห้ามแก้ยอดตรง ๆ" />
      <div className="card mb-4 flex gap-2">
        <input className="input" placeholder="อีเมล ชื่อ หรือ QR ผู้ใช้" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primary" type="button" onClick={find}>ค้นหา</button>
      </div>
      {target ? (
        <div className="card space-y-3">
          <p className="font-medium">{target.fullName} · คงเหลือ {formatToken(wallet.balance)}</p>
          <div className="flex flex-wrap gap-2">
            {settings.tokenPackages.map((p) => <button key={p.id} type="button" className="btn-secondary" onClick={() => applyPkg(p)}>{p.tokens} Token / {p.price} บาท</button>)}
          </div>
          <label className="label">จำนวน Token</label>
          <input className="input" type="number" value={tokens} onChange={(e) => { setTokens(e.target.value); setCash(Number(e.target.value) * settings.tokenPriceTHB) }} />
          <p>ยอดเงินที่ควรรับ: {cash} บาท (ราคา {settings.tokenPriceTHB} บาท/Token)</p>
          <button className="btn-success" type="button" onClick={confirm}>ยืนยันรับเงินและเติม Token</button>
        </div>
      ) : null}
    </div>
  )
}
