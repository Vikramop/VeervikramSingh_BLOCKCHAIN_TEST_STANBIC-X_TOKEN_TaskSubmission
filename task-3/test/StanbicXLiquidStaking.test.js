const { expect } = require('chai');
const { ethers } = require('hardhat');

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
      ethers.ZeroAddress, // Mock STRADA (not used here)
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

    const earned = await stSXT.earned(user.address);
    expect(earned).to.equal(rewardRate * 3600n); // 100 * 3600 = 360000
  });
});
