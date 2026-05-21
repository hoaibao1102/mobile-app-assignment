export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "";

  const num = Number(value);
  if (Number.isNaN(num)) return String(value);

  try {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch (e) {
    return "$" + num.toFixed(2);
  }
}

export function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "0%";

  const num = Number(value);
  if (Number.isNaN(num)) return String(value);

  const percent = num <= 1 ? num * 100 : num;
  // show integer percent when possible, otherwise one decimal
  const rounded =
    Math.round(percent) === percent ? percent : Number(percent.toFixed(1));
  return `${rounded}%`;
}

export default { formatCurrency, formatPercent };
