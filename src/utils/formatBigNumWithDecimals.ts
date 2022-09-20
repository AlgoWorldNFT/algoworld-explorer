const formatBigNumWithDecimals = (num: bigint, decimals: number): string => {
  const singleUnit = BigInt(`1` + `0`.repeat(decimals));
  const wholeUnits = num / singleUnit;
  const fractionalUnits = num % singleUnit;

  return (
    wholeUnits.toString() +
    `.` +
    fractionalUnits.toString().padStart(decimals, `0`)
  );
};

export default formatBigNumWithDecimals;
