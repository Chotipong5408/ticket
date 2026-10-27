export const PAYMENT_LABELS = {
  awaiting_payment: 'รอชำระเงิน',
  pending_verification: 'รอตรวจสอบ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธหลักฐาน',
  cancelled: 'ยกเลิก',
}

export const TICKET_LABELS = {
  unconfirmed: 'ยังไม่ยืนยัน',
  issued: 'พร้อมใช้',
  used: 'เข้างานแล้ว',
  cancelled: 'ยกเลิก',
  disabled: 'ปิดใช้งาน',
}

export const CHECKIN_LABELS = {
  valid: 'Valid Ticket',
  already_used: 'Already Used',
  unconfirmed: 'Unconfirmed',
  invalid: 'Invalid Ticket',
  disabled: 'Disabled Ticket',
}

export const STATUS_TONE = {
  awaiting_payment: 'orange',
  pending_verification: 'orange',
  approved: 'green',
  issued: 'green',
  valid: 'green',
  rejected: 'red',
  cancelled: 'slate',
  unconfirmed: 'orange',
  used: 'slate',
  disabled: 'red',
  already_used: 'red',
  invalid: 'red',
  paid: 'green',
  open: 'blue',
  expired: 'slate',
  confirmed: 'green',
  pending_payment: 'orange',
}
