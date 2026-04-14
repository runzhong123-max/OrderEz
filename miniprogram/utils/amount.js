function normalizeAmount(value) {
  return Number(Number(value || 0).toFixed(2));
}

function multiplyAmount(unitPrice, quantity) {
  return normalizeAmount(Number(unitPrice || 0) * Number(quantity || 0));
}

function sumAmounts(amountList) {
  const safeAmountList = Array.isArray(amountList) ? amountList : [];

  return normalizeAmount(
    safeAmountList.reduce((sum, amount) => sum + Number(amount || 0), 0)
  );
}

module.exports = {
  normalizeAmount,
  multiplyAmount,
  sumAmounts,
};
