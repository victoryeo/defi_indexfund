const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const verbose = process.env.VERBOSE;

const truffleAssert = require('truffle-assertions');
const { calcOutGivenIn, calcRelativeDiff, calcInGivenOut } = require('../src/lib/calc');


contract('BPool', async (accounts) => {
    const admin = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const { toWei } = web3.utils;
    const { fromWei } = web3.utils;
    const errorDelta = 10 ** -8;
    const MAX = web3.utils.toTwosComplement(-1);

    let WETH; let MKR; let DAI; let XXX; // addresses
    let weth; let mkr; let dai; let xxx; // TTokens
    let factory; // BPool factory
    let pool; // first pool w/ defaults
    let POOL; //   pool address

    before(async () => {
        factory = await BFactory.deployed();

        POOL = await factory.newBPool.call();
        await factory.newBPool();
        pool = await BPool.at(POOL);

        weth = await TToken.new('Wrapped Ether', 'WETH', 18);
        mkr = await TToken.new('Maker', 'MKR', 18);
        dai = await TToken.new('Dai Stablecoin', 'DAI', 18);
        xxx = await TToken.new('XXX', 'XXX', 18);

        WETH = weth.address;
        MKR = mkr.address;
        DAI = dai.address;
        XXX = xxx.address;

        /*
            Tests assume token prices
            WETH - $200
            MKR  - $500
            DAI  - $1
            XXX  - $0
        */

        // Admin balances
        await weth.mint(admin, toWei('50'));
        await mkr.mint(admin, toWei('20'));
        await dai.mint(admin, toWei('10000'));
        await xxx.mint(admin, toWei('10'));

        // User1 balances
        await weth.mint(user1, toWei('25'), { from: admin });
        await mkr.mint(user1, toWei('4'), { from: admin });
        await dai.mint(user1, toWei('40000'), { from: admin });
        await xxx.mint(user1, toWei('10'), { from: admin });

        // User2 balances
        await weth.mint(user2, toWei('12.2222'), { from: admin });
        await mkr.mint(user2, toWei('1.015333'), { from: admin });
        await dai.mint(user2, toWei('0'), { from: admin });
        await xxx.mint(user2, toWei('51'), { from: admin });
    });

    describe('Binding Tokens', () => {
        it('Controller is msg.sender', async () => {
            const controller = await pool.getController();
            assert.equal(controller, admin);
        });

        it('Pool starts with no bound tokens', async () => {
            const numTokens = await pool.getNumTokens();
            assert.equal(0, numTokens);
            const isBound = await pool.isBound.call(WETH);
            assert(!isBound);
        });

        it('Fails binding tokens that are not approved', async () => {
            await truffleAssert.reverts(
                pool.bind(MKR, toWei('10'), toWei('2.5')),
                'ERR_BTOKEN_CALLER_NOT_ALLOWED',
            );
        });

        it('Admin approves tokens', async () => {
            await weth.approve(POOL, MAX);
            await mkr.approve(POOL, MAX);
            await dai.approve(POOL, MAX);
            await xxx.approve(POOL, MAX);
        });

        it('binding tokens that are approved', async () => {
            await truffleAssert.passes(
                pool.bind(MKR, toWei('20'), toWei('5'))
            );
            //NotSame event is raised because in TToken transferFrom 
            //msg.sender is POOL address and src is accounts[0]
            mkr.getPastEvents('NotSame', {fromBlock: 0, toBlock: 'latest'}, {})
            .then(function(events){
                console.log(POOL)
                console.log(events) 
            })
        });

        it('Fails binding weights and balances outside MIX MAX', async () => {
            await truffleAssert.reverts(
                pool.bind(WETH, toWei('51'), toWei('1')),
                'ERR_INSUFFICIENT_BAL',
            );
            await truffleAssert.reverts(
                pool.bind(DAI, toWei('1000'), toWei('0.99')),
                'ERR_MIN_WEIGHT',
            );
            await truffleAssert.reverts(
                pool.bind(WETH, toWei('5'), toWei('50.01')),
                'ERR_MAX_WEIGHT',
            );
        });

        it('Fails finalizing pool without 2 tokens', async () => {
            await truffleAssert.reverts(
                pool.finalize(),
                'ERR_MIN_TOKENS',
            );
        });

        /*it('Finalizing pool with 2 tokens', async () => {
            await truffleAssert.passes(
                pool.bind(WETH, toWei('50'), toWei('5'))
            );
            await truffleAssert.passes(
                pool.finalize(),
            );
        });*/

        it('Admin binds tokens', async () => {
            // Equal weights WETH, MKR, DAI
            await pool.bind(WETH, toWei('50'), toWei('5'));
            await pool.bind(DAI, toWei('10000'), toWei('5'));
            const numTokens = await pool.getNumTokens();
            assert.equal(3, numTokens);
            const totalDernomWeight = await pool.getTotalDenormalizedWeight();
            assert.equal(15, fromWei(totalDernomWeight));
            const wethDenormWeight = await pool.getDenormalizedWeight(WETH);
            assert.equal(5, fromWei(wethDenormWeight));
            const wethNormWeight = await pool.getNormalizedWeight(WETH);
            assert.equal(0.333333333333333333, fromWei(wethNormWeight));
            const mkrBalance = await pool.getBalance(MKR);
            assert.equal(20, fromWei(mkrBalance));
        });

        it('Admin unbinds token', async () => {
            await pool.bind(XXX, toWei('10'), toWei('5'));
            let adminBalance = await xxx.balanceOf(admin);
            assert.equal(0, fromWei(adminBalance));
            await pool.unbind(XXX);
            adminBalance = await xxx.balanceOf(admin);
            assert.equal(10, fromWei(adminBalance));
            const numTokens = await pool.getNumTokens();
            assert.equal(3, numTokens);
            const totalDernomWeight = await pool.getTotalDenormalizedWeight();
            assert.equal(15, fromWei(totalDernomWeight));
        });

        it('Fails binding above MAX TOTAL WEIGHT', async () => {
            //MAX_TOTAL_WEIGHT is 50
            await truffleAssert.reverts(
                pool.bind(XXX, toWei('1'), toWei('36')),
                'ERR_MAX_TOTAL_WEIGHT',
            );
        });

        it('Fails rebinding token or unbinding random token', async () => {
            await truffleAssert.reverts(
                pool.bind(WETH, toWei('0'), toWei('1')),
                'ERR_IS_BOUND',
            );
            await truffleAssert.reverts(
                pool.rebind(XXX, toWei('0'), toWei('1')),
                'ERR_NOT_BOUND',
            );
            await truffleAssert.reverts(
                pool.unbind(XXX),
                'ERR_NOT_BOUND',
            );
        });

        it('Get current tokens', async () => {
            const currentTokens = await pool.getCurrentTokens();
            assert.sameMembers(currentTokens, [WETH, MKR, DAI]);
        });

        it('Fails getting final tokens before finalized', async () => {
            await truffleAssert.reverts(
                pool.getFinalTokens(),
                'ERR_NOT_FINALIZED',
            );
        });
    })

    describe('Finalizing pool', () => {
        it('Fails when other users interact before finalizing', async () => {
            await truffleAssert.reverts(
                pool.bind(WETH, toWei('5'), toWei('5'), { from: user1 }),
                'ERR_NOT_CONTROLLER',
            );
            await truffleAssert.reverts(
                pool.joinPool(toWei('1'), [MAX, MAX], { from: user1 }),
                'ERR_NOT_FINALIZED',
            );
            await truffleAssert.reverts(
                pool.exitPool(toWei('1'), [toWei('0'), toWei('0')], { from: user1 }),
                'ERR_NOT_FINALIZED',
            );
            await truffleAssert.reverts(
                pool.unbind(DAI, { from: user1 }),
                'ERR_NOT_CONTROLLER',
            );
        });

        it('Fails calling any swap before finalizing', async () => {
            await truffleAssert.reverts(
                pool.swapExactAmountIn(WETH, toWei('2.5'), DAI, toWei('475'), toWei('200')),
                'ERR_SWAP_NOT_PUBLIC',
            );
            await truffleAssert.reverts(
                pool.swapExactAmountIn(DAI, toWei('2.5'), WETH, toWei('475'), toWei('200')),
                'ERR_SWAP_NOT_PUBLIC',
            );
            await truffleAssert.reverts(
                pool.swapExactAmountOut(WETH, toWei('2.5'), DAI, toWei('475'), toWei('200')),
                'ERR_SWAP_NOT_PUBLIC',
            );
            await truffleAssert.reverts(
                pool.swapExactAmountOut(DAI, toWei('2.5'), WETH, toWei('475'), toWei('200')),
                'ERR_SWAP_NOT_PUBLIC',
            );
        });

        it('Fails calling any join exit swap before finalizing', async () => {
            await truffleAssert.reverts(
                pool.joinswapExternAmountIn(WETH, toWei('2.5'), toWei('0')),
                'ERR_NOT_FINALIZED',
            );
            await truffleAssert.reverts(
                pool.joinswapPoolAmountOut(WETH, toWei('2.5'), MAX),
                'ERR_NOT_FINALIZED',
            );
            await truffleAssert.reverts(
                pool.exitswapPoolAmountIn(WETH, toWei('2.5'), toWei('0')),
                'ERR_NOT_FINALIZED',
            );
            await truffleAssert.reverts(
                pool.exitswapExternAmountOut(WETH, toWei('2.5'), MAX),
                'ERR_NOT_FINALIZED',
            );
        });

        it('Only controller can setPublicSwap', async () => {
            await pool.setPublicSwap(true);
            const publicSwap = pool.isPublicSwap();
            assert(publicSwap);
            await truffleAssert.reverts(pool.setPublicSwap(true, { from: user1 }), 'ERR_NOT_CONTROLLER');
        });

        it('Fails setting low swap fees', async () => {
            await truffleAssert.reverts(
                pool.setSwapFee(toWei('0.0000001')),
                'ERR_MIN_FEE',
            );
        });

        it('Fails setting high swap fees', async () => {
            await truffleAssert.reverts(
                pool.setSwapFee(toWei('0.11')),
                'ERR_MAX_FEE',
            );
        });

        it('Fails nonadmin sets fees or controller', async () => {
            await truffleAssert.reverts(
                pool.setSwapFee(toWei('0.003'), { from: user1 }),
                'ERR_NOT_CONTROLLER',
            );
            await truffleAssert.reverts(
                pool.setController(user1, { from: user1 }),
                'ERR_NOT_CONTROLLER',
            );
        });

        it('Admin sets controller', async () => {
            await truffleAssert.passes(
                pool.setController(user1, { from: admin })
            ); 
            await truffleAssert.passes(
                pool.setController(admin, { from: user1 })
            ); 
        })

        it('Admin sets swap fees', async () => {
            await pool.setSwapFee(toWei('0.003'));
            const swapFee = await pool.getSwapFee();
            assert.equal(0.003, fromWei(swapFee));
        });

        it('Fails nonadmin finalizes pool', async () => {
            await truffleAssert.reverts(
                pool.finalize({ from: user1 }),
                'ERR_NOT_CONTROLLER',
            );
        });

        it('Admin finalizes pool', async () => {
            const tx = await pool.finalize();
            const adminBal = await pool.balanceOf(admin);
            console.log(`adminBal ${adminBal}`);
            assert.equal(100, fromWei(adminBal));
            truffleAssert.eventEmitted(tx, 'Transfer', (event) => event.dst === admin);
            const finalized = pool.isFinalized();
            assert(finalized);
        });

        it('Cannot setPublicSwap, setSwapFee when finalized', async () => {
            await truffleAssert.reverts(pool.setPublicSwap(false), 'ERR_IS_FINALIZED');
            await truffleAssert.reverts(pool.setSwapFee(toWei('0.01')), 'ERR_IS_FINALIZED');
        });

        it('Fails binding new token after finalized', async () => {
            await truffleAssert.reverts(
                pool.bind(XXX, toWei('10'), toWei('5')),
                'ERR_IS_FINALIZED',
            );
            await truffleAssert.reverts(
                pool.rebind(DAI, toWei('10'), toWei('5')),
                'ERR_IS_FINALIZED',
            );
        });

        it('Fails unbinding after finalized', async () => {
            await truffleAssert.reverts(
                pool.unbind(WETH),
                'ERR_IS_FINALIZED',
            );
        });

        it('Get final tokens', async () => {
            const finalTokens = await pool.getFinalTokens();
            assert.sameMembers(finalTokens, [WETH, MKR, DAI]);
        });
    })

    describe('User interactions', () => {
        it('Other users approve tokens', async () => {
            await weth.approve(POOL, MAX, { from: user1 });
            await mkr.approve(POOL, MAX, { from: user1 });
            await dai.approve(POOL, MAX, { from: user1 });
            await xxx.approve(POOL, MAX, { from: user1 });

            await weth.approve(POOL, MAX, { from: user2 });
            await mkr.approve(POOL, MAX, { from: user2 });
            await dai.approve(POOL, MAX, { from: user2 });
            await xxx.approve(POOL, MAX, { from: user2 });
        });

        it('User1 joins pool', async () => {
            const userWethBalanceBeg = await weth.balanceOf(user1);
            console.log(userWethBalanceBeg.toString())
            const daiBalanceBeg = await pool.getBalance(DAI)
            console.log(daiBalanceBeg.toString())
            //In joinPool, transfer the token from 0 to POOL (mint)
            //then transfer from POOL to user1 (push)
            //for amount of , takes place in BToken
            const tx = await pool.joinPool(toWei('4'), [MAX, MAX, MAX], { from: user1 });
            truffleAssert.eventEmitted(tx, 'Transfer', (event) => event.dst === user1)
            /*pool.getPastEvents('Transfer', {fromBlock: 0, toBlock: 'latest'}, {})
              .then(function(events){
                console.log(events) 
            })*/
            const daiBalance = await pool.getBalance(DAI);
            console.log(daiBalance.toString())
            //initially. DAI balance is 10000
            assert.equal(10400, fromWei(daiBalance));
            const userWethBalance = await weth.balanceOf(user1);
            console.log(userWethBalance.toString())
            //initially, user1 weth balance is 25
            assert.equal(23, fromWei(userWethBalance));

            const wethBalance = await pool.getBalance(WETH);
            console.log(wethBalance.toString())
            const mkrBalance = await pool.getBalance(MKR);
            console.log(mkrBalance.toString())
        });

        /*
          Current pool balances
          WETH - 52
          MKR - 20.8
          DAI - 10,400
          XXX - 0
        */

        it('getSpotPriceSansFee and getSpotPrice', async () => {
            const wethPrice = await pool.getSpotPriceSansFee(DAI, WETH);
            assert.equal(200, fromWei(wethPrice));

            const wethPriceFee = await pool.getSpotPrice(DAI, WETH);
            const wethPriceFeeCheck = ((10400 / 5) / (52 / 5)) * (1 / (1 - 0.003));
            // 200.6018054162487462
            console.log(fromWei(wethPriceFee), wethPriceFeeCheck);
            assert.equal(fromWei(wethPriceFee), wethPriceFeeCheck);
        });

        it('Fail swapExactAmountIn unbound or over min max ratios', async () => {
            await truffleAssert.reverts(
                pool.swapExactAmountIn(WETH, toWei('2.5'), XXX, toWei('100'), toWei('200'), { from: user2 }),
                'ERR_NOT_BOUND',
            );
            await truffleAssert.reverts(
                pool.swapExactAmountIn(WETH, toWei('26.5'), DAI, toWei('5000'), toWei('200'), { from: user2 }),
                'ERR_MAX_IN_RATIO',
            );
        });

        it('swapExactAmountIn', async () => {
            // 2.5 WETH -> DAI
            // calcOutGivenIn parameters:                                                                         //
            //uint tokenBalanceIn,
            //uint tokenWeightIn,
            //uint tokenBalanceOut,
            //uint tokenWeightOut,
            //uint tokenAmountIn,
            //uint swapFee     
            const expected = calcOutGivenIn(52, 5, 10400, 5, 2.5, 0.003);
            const txr = await pool.swapExactAmountIn(
                WETH,
                toWei('2.5'),
                DAI,
                toWei('475'),
                toWei('200'),
                { from: user2 },
            );
            if (verbose) {
                //token in
                console.log("tokenIn ", Number(fromWei(txr.logs[0].args[3])));
                //token out
                console.log("tokenOut ", Number(fromWei(txr.logs[0].args[4])));
            }
            const log = txr.logs[0];
            assert.equal(log.event, 'LOG_SWAP');
            // 475.905805337091423

            const actual = fromWei(log.args[4]);
            const relDif = calcRelativeDiff(expected, actual);
            if (verbose) {
                console.log('swapExactAmountIn');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif.toNumber(), errorDelta);

            const userDaiBalance = await dai.balanceOf(user2);
            if (verbose) {
                console.log(fromWei(userDaiBalance));
                console.log(Number(fromWei(log.args[4])));
            }
            assert.equal(fromWei(userDaiBalance), Number(fromWei(log.args[4])));

            const wethPrice = await pool.getSpotPrice(DAI, WETH);
            //WETH 52+2.5 = 54.5
            //DAI 10400-475 = 9925
            const wethPriceFeeCheck = ((9924.301394662908577 / 5) / (54.5 / 5)) * (1 / (1 - 0.003));
            if (verbose) {
                console.log("wethPrice ", Number(fromWei(wethPrice)));
                console.log("wethPriceFeeCheck ", Number(wethPriceFeeCheck));
            }           
            assert.approximately(Number(fromWei(wethPrice)), Number(wethPriceFeeCheck), errorDelta*1000);

            const daiNormWeight = await pool.getNormalizedWeight(DAI);
            assert.equal(0.333333333333333333, fromWei(daiNormWeight));
        });

        it('swapExactAmountOut', async () => {
            // ETH -> 1 MKR
            // calcInGivenOut parameters:
            //uint tokenBalanceIn,
            //uint tokenWeightIn,
            //uint tokenBalanceOut,
            //uint tokenWeightOut,
            //uint tokenAmountOut,
            //uint swapFee
            // WETH 54.5 ,   MKR 20.8
            const expected = calcInGivenOut(54.5, 5, 20.8, 5, 1, 0.003);
            const txr = await pool.swapExactAmountOut(
                WETH,
                toWei('3'),
                MKR,
                toWei('1.0'),
                toWei('500'),
                { from: user2 },
            );
            const log = txr.logs[0];
            assert.equal(log.event, 'LOG_SWAP');
            // 2.758274824473420261

            const actual = fromWei(log.args[3]);
            const relDif = calcRelativeDiff(expected, actual);
            if (verbose) {
                console.log('swapExactAmountOut');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif.toNumber(), errorDelta);
        });
    })

    describe('Miscellaneous', () => {
        it('hello world', async () => {
            const hw = await pool.helloworld.call();
            console.log(hw)
            assert.equal(hw, "helloworld")
        })
    })
})