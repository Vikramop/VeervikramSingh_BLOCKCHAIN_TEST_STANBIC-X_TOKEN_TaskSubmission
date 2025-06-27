const chai = require('chai');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('StanbicXLiquidStaking', function () {
  let stSXT, SXT, STRADA, owner, user;
  const initialSupply = ethers.parseEther('1000000');
  const stakeAmount = ethers.parseEther('100');
  const rewardRate = 100n; // 100 wei per second

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    // Deploy SXT token (staking token)
    const SXToken = await ethers.getContractFactory('SXToken');
    SXT = await SXToken.deploy(
      ethers.ZeroAddress, // Mock BLX
      ethers.ZeroAddress, // Mock STRADA
      initialSupply
    );

    // Deploy STRADA token (reward token)
    const STRADAToken = await ethers.getContractFactory('STRADAToken');
    STRADA = await STRADAToken.deploy(initialSupply);

    // Deploy staking contract
    const StanbicXLiquidStaking = await ethers.getContractFactory(
      'StanbicXLiquidStaking'
    );
    stSXT = await StanbicXLiquidStaking.deploy(
      await SXT.getAddress(), // staking token (SXT)
      await STRADA.getAddress(), // reward token (STRADA)
      rewardRate
    );

    // Fund staking contract with STRADA for rewards (as owner, so excluded from maxTxAmount)
    await STRADA.connect(owner).transfer(
      await stSXT.getAddress(),
      initialSupply
    );

    // Fund user with SXT for staking
    await SXT.mint(user.address, stakeAmount);
  });

  it('Should mint stSXT 1:1 when staking', async () => {
    await SXT.connect(user).approve(await stSXT.getAddress(), stakeAmount);
    await stSXT.connect(user).stake(stakeAmount);

    expect(await stSXT.balanceOf(user.address)).to.equal(stakeAmount);
  });

  it('Should accumulate STRADA rewards over time', async () => {
    await SXT.connect(user).approve(await stSXT.getAddress(), stakeAmount);
    await stSXT.connect(user).stake(stakeAmount);

    // Advance time by 1 hour (3600 seconds)
    await ethers.provider.send('evm_increaseTime', [3600]);
    await ethers.provider.send('evm_mine');

    const expectedRewards = Number(rewardRate) * 3600; // Convert BigInt to Number
    const actualRewards = Number(await stSXT.earned(user.address)); // Convert BigInt to Number

    // Allow a small buffer for timing discrepancies
    const buffer = 300;
    expect(actualRewards).to.be.within(
      expectedRewards - buffer,
      expectedRewards + buffer
    );
  });

  it('Should allow users to unstake and receive SXT and rewards', async () => {
    // Approve and stake SXT
    await SXT.connect(user).approve(await stSXT.getAddress(), stakeAmount);
    await stSXT.connect(user).stake(stakeAmount);

    // Advance time by 1 hour to accumulate rewards
    await ethers.provider.send('evm_increaseTime', [3600]);
    await ethers.provider.send('evm_mine');

    // Unstake stSXT
    const stSXTBalance = await stSXT.balanceOf(user.address);
    await stSXT.connect(user).unstake(stSXTBalance);

    // Check user received SXT back
    const userSXTBalance = await SXT.balanceOf(user.address);
    expect(userSXTBalance).to.equal(stakeAmount); // Entire staked amount should be returned

    // Check rewards are paid in STRADA
    const userRewardBalance = BigInt(await STRADA.balanceOf(user.address)); // Convert to BigInt
    const expectedRewards = rewardRate * 3600n; // Expected rewards in BigInt

    // Define the buffer as BigInt
    const buffer = 300n;

    // Adjust the assertion for BigInt
    expect(userRewardBalance).to.satisfy(
      (balance) =>
        balance >= expectedRewards - buffer &&
        balance <= expectedRewards + buffer,
      `Expected reward balance to be within range ${
        expectedRewards - buffer
      } and ${expectedRewards + buffer}, but got ${userRewardBalance}`
    );

    // Check user's stSXT balance is zero
    const userStSXTBalance = BigInt(await stSXT.balanceOf(user.address)); // Ensure BigInt
    expect(userStSXTBalance).to.equal(0n); // Compare with BigInt 0
  });
});
