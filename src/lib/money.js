export function formatTHB(amount) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export function formatToken(amount) {
  return `${new Intl.NumberFormat('th-TH').format(Number(amount) || 0)} Token`
}
