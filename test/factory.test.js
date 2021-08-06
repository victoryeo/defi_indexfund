const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const BConst = artifacts.require('BConst');

const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract('BFactory', async (accounts) => {
  const admin = accounts[0];
  const nonAdmin = accounts[1];
  const user2 = accounts[2];
  const { toWei } = web3.utils;
  const { fromWei } = web3.utils;
  const { hexToUtf8 } = web3.utils;

  const MAX = web3.utils.toTwosComplement(-1);

  let factory;
  let pool;
  let POOL;
  let WETH;
  let DAI;
  let weth;
  let dai;

  before(async () => {
    bconst = await BConst.deployed();

    factory = await BFactory.deployed();
    weth = await TToken.new('Wrapped Ether', 'WETH', 18);
    dai = await TToken.new('Dai Stablecoin', 'DAI', 18);

    WETH = weth.address;
    DAI = dai.address;

    // admin balances
    await weth.mint(admin, toWei('5'));
    await dai.mint(admin, toWei('200'));

    // nonAdmin balances
    await weth.mint(nonAdmin, toWei('1'), { from: admin });
    await dai.mint(nonAdmin, toWei('50'), { from: admin });

    POOL = await factory.newBPool.call(); // this works fine in clean room
    console.log(`POOL ${POOL}`)
    await factory.newBPool();
    pool = await BPool.at(POOL);
    //console.log("pool ", pool)

    await weth.approve(POOL, MAX);
    await dai.approve(POOL, MAX);
    console.log(`MAX ${MAX}`)

    await weth.approve(POOL, MAX, { from: nonAdmin });
    await dai.approve(POOL, MAX, { from: nonAdmin });
  });

  describe('Factory', () => {
    it('isBPool on non pool returns false', async () => {
        const isBPool = await factory.isBPool(admin);
        assert.isFalse(isBPool);
    });

    it('isBPool on pool returns true', async () => {
      const isBPool = await factory.isBPool(POOL);
      assert.isTrue(isBPool);
    });

    it('isBlab equal to account 0', async() => {
      const blab = await factory.getBLabs()
      console.log(`blab ${blab}`)
      assert.equal(blab, accounts[0])
    })

    it('fails nonAdmin calls collect', async () => {
      // expect to fail because
      // nonAdmin is not same as blab
      await truffleAssert.reverts(factory.collect(nonAdmin, { from: nonAdmin }), 'ERR_NOT_BLABS');
    });

    it('admin collects fees', async () => {
      let adminBalance = await pool.balanceOf(admin);
      console.log("adminBalance ", adminBalance.toString())

      await pool.bind(WETH, toWei('5'), toWei('5'));
      await pool.bind(DAI, toWei('200'), toWei('5'));

      await pool.finalize();

      adminBalance = await pool.balanceOf(admin);
      console.log("adminBalance ", adminBalance.toString())

      await pool.joinPool(toWei('10'), [MAX, MAX], { from: nonAdmin });
      await pool.exitPool(toWei('10'), [toWei('0'), toWei('0')], { from: nonAdmin });

      const thisbalance = await factory.getThisBalance(POOL)
      console.log("thisbalance ", thisbalance.toString())
      // Exit fee = 0 so this does nothing
      await factory.collect(POOL);

      const BONE = await bconst.getBONE()
      const INIT_POOL_SUPPLY = await bconst.getINITPOOLSUPPLY()
      const amount = INIT_POOL_SUPPLY/BONE
      assert.equal(fromWei(adminBalance), amount);
    });
  })

})  