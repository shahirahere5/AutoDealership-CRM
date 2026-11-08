export const money = (n: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(n);
export const date = (s: string) => new Date(s).toLocaleDateString(undefined, {
  month: 'short',
  day: 'numeric'
});
