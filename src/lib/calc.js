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

function calcInGivenOut(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountOut, swapFee) {
    const weightRatio = Decimal(tokenWeightOut).div(Decimal(tokenWeightIn));
    const diff = Decimal(tokenBalanceOut).minus(tokenAmountOut);
    const y = Decimal(tokenBalanceOut).div(diff);
    const foo = y.pow(weightRatio).minus(Decimal(1));
    const tokenAmountIn = (Decimal(tokenBalanceIn).times(foo)).div(Decimal(1).minus(Decimal(swapFee)));
    return tokenAmountIn;
}

function calcSpotPrice(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, swapFee) {
    const numer = Decimal(tokenBalanceIn).div(Decimal(tokenWeightIn));
    const denom = Decimal(tokenBalanceOut).div(Decimal(tokenWeightOut));
    const ratio = numer.div(denom);
    const scale = Decimal(1).div(Decimal(1).sub(Decimal(swapFee)));
    const spotPrice = ratio.mul(scale);
    return spotPrice;
}

module.exports = {
    calcRelativeDiff,
    calcOutGivenIn,
    calcInGivenOut,
    calcSpotPrice
}