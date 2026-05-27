function displayValue(value) {
  return value === null || value === undefined || value === "" ? "-" : value;
}

function formatBoolean(value, trueLabel = "Yes", falseLabel = "No") {
  if (value === null || value === undefined) return "-";
  return value ? trueLabel : falseLabel;
}

function formatCurrency(value) {
  return `€${Number(value || 0).toFixed(2)}`;
}

function formatHour(hour) {
  return hour === null || hour === undefined ? "-" : `${hour}:00`;
}

function formatDateTime(dateValue, hour) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  const formattedDate = Number.isNaN(date.getTime())
    ? dateValue
    : date.toLocaleDateString();

  return hour === null || hour === undefined
    ? formattedDate
    : `${formattedDate} · ${hour}:00`;
}

function formatScore(score) {
  return Math.min(100, Math.max(0, Math.round(Number(score || 0) * 100)));
}

export {
  displayValue,
  formatBoolean,
  formatCurrency,
  formatDateTime,
  formatHour,
  formatScore,
};
