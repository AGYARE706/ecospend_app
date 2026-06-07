export function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}
