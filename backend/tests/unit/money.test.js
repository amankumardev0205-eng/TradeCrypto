const money = require('../../utils/money');

describe('Financial Math Utility (money.js)', () => {
  it('correctly handles floating point addition edge cases (0.1 + 0.2)', () => {
    const result = money.add(0.1, 0.2, 2);
    expect(result).toBe(0.3);
  });

  it('correctly calculates fee on 100.00 at 0.2%', () => {
    const fee = money.calcFee(100.00, 0.002);
    expect(fee).toBe(0.2);
  });

  it('calculates total buy cost accurately (tradeValue + fee)', () => {
    const totalCost = money.calcTotalCost(50000, 100);
    expect(totalCost).toBe(50100);
  });

  it('calculates net sell proceeds accurately (tradeValue - fee)', () => {
    const netProceeds = money.calcNetProceeds(50000, 100);
    expect(netProceeds).toBe(49900);
  });

  it('handles division by zero gracefully by throwing error', () => {
    expect(() => money.div(100, 0)).toThrow('Division by zero in financial calculation');
  });

  it('rounds to specified decimal places with EPSILON safety', () => {
    expect(money.round(1.005, 2)).toBe(1.01);
    expect(money.round(0.000000019, 8)).toBe(0.00000002);
  });
});
