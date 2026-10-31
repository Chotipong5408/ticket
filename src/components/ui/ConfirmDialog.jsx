import { Modal } from './Modal'
import { AlertTriangle } from 'lucide-react'

export function ConfirmDialog({ open, title, message, confirmLabel = 'ยืนยัน', danger, onConfirm, onClose }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>
            ยกเลิก
          </button>
          <button type="button" className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${danger ? 'bg-red-100' : 'bg-brand-100'}`}>
          <AlertTriangle className={`h-5 w-5 ${danger ? 'text-red-600' : 'text-brand-600'}`} />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed pt-2">{message}</p>
      </div>
    </Modal>
  )
}
