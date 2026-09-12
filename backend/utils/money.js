/**
 * Financial Precision & Math Utility
 * Protects monetary and cryptocurrency calculations against IEEE 754 floating-point drift.
 */
const DEFAULT_DECIMALS = 8;
const FIAT_DECIMALS = 2;

/**
 * Precise rounding using Number.EPSILON to prevent 0.1 + 0.2 = 0.30000000000000004
 */
function round(value, decimals = DEFAULT_DECIMALS) {
  const num = Number(value || 0);
  if (isNaN(num)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Exact Addition
 */
function add(a, b, decimals = DEFAULT_DECIMALS) {
  const numA = Number(a || 0);
  const numB = Number(b || 0);
  return round(numA + numB, decimals);
}

/**
 * Exact Subtraction
 */
function sub(a, b, decimals = DEFAULT_DECIMALS) {
  const numA = Number(a || 0);
  const numB = Number(b || 0);
  return round(numA - numB, decimals);
}

/**
 * Exact Multiplication
 */
function mul(a, b, decimals = DEFAULT_DECIMALS) {
  const numA = Number(a || 0);
  const numB = Number(b || 0);
  return round(numA * numB, decimals);
}

/**
 * Exact Division
 */
function div(a, b, decimals = DEFAULT_DECIMALS) {
  const numA = Number(a || 0);
  const numB = Number(b || 0);
  if (numB === 0) throw new Error('Division by zero in financial calculation');
  return round(numA / numB, decimals);
}

/**
 * Calculate Trading Fee (0.2% default)
 */
function calcFee(tradeValue, feeRate = 0.002, decimals = DEFAULT_DECIMALS) {
  const value = Number(tradeValue || 0);
  const rate = Number(feeRate || 0);
  return round(value * rate, decimals);
}

/**
 * Calculate Total Cost for Buy (tradeValue + fee)
 */
function calcTotalCost(tradeValue, fee, decimals = DEFAULT_DECIMALS) {
  return add(tradeValue, fee, decimals);
}

/**
 * Calculate Net Proceeds for Sell (tradeValue - fee)
 */
function calcNetProceeds(tradeValue, fee, decimals = DEFAULT_DECIMALS) {
  return sub(tradeValue, fee, decimals);
}

module.exports = {
  round,
  add,
  sub,
  mul,
  div,
  calcFee,
  calcTotalCost,
  calcNetProceeds,
  DEFAULT_DECIMALS,
  FIAT_DECIMALS,
};
