const Decimal = require('decimal.js');

function calcRelativeDiff(expected, actual) {
    return ((Decimal(expected).minus(Decimal(actual))).div(expected)).abs();
}

function calcOutGivenIn(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountIn, swapFee) {
    const weightRatio = Decimal(tokenWeightIn).div(Decimal(tokenWeightOut));
    const adjustedIn = Decimal(tokenAmountIn).times((Decimal(1).minus(Decimal(swapFee))));
    const y = Decimal(tokenBalanceIn).div(Decimal(tokenBalanceIn).plus(adjustedIn));
    const foo = y.pow(weightRatio);
    const bar = Decimal(1).minus(foo);
    const tokenAmountOut = Decimal(tokenBalanceOut).times(bar);
    return tokenAmountOut;
}

module.exports = {
    calcRelativeDiff,
    calcOutGivenIn
}