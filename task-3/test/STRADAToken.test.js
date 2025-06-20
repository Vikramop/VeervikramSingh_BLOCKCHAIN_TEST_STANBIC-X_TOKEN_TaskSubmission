const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('StanbicXLiquidStaking', function () {
  let sxtToken, liquidStaking, owner, user1, user2;
  const initialSupply = ethers.parseEther('1000000');
  const stakeAmount = ethers.parseEther('1000');

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock SXT token
    const ERC20Mock = await ethers.getContractFactory('ERC20Mock');
    sxtToken = await ERC20Mock.deploy('SXT Token', 'SXT', initialSupply);

    // Get deployed SXT token address
    const sxtTokenAddress = await sxtToken.getAddress();

    // Deploy liquid staking contract with SXT token address
    const StanbicXLiquidStaking = await ethers.getContractFactory(
      'StanbicXLiquidStaking'
    );
    liquidStaking = await StanbicXLiquidStaking.deploy(sxtTokenAddress);

    // Distribute SXT tokens to users
    await sxtToken.transfer(user1.address, stakeAmount * 10n);
    await sxtToken.transfer(user2.address, stakeAmount * 10n);
  });

  it('should allow user to stake SXT and receive stSXT', async function () {
    await sxtToken
      .connect(user1)
      .approve(await liquidStaking.getAddress(), stakeAmount);

    await expect(liquidStaking.connect(user1).stake(stakeAmount))
      .to.emit(liquidStaking, 'Transfer') // ERC20 mint event
      .withArgs(
        '0x0000000000000000000000000000000000000000', // zero address as 'from' for mint
        user1.address, // correct user address
        stakeAmount
      );

    expect(await liquidStaking.balanceOf(user1.address)).to.equal(stakeAmount);
    expect(await liquidStaking.totalSupply()).to.equal(stakeAmount);
  });

  it('should allow user to unstake by burning stSXT and receive SXT', async function () {
    const liquidStakingAddress = await liquidStaking.getAddress();

    await sxtToken.connect(user1).approve(liquidStakingAddress, stakeAmount);
    await liquidStaking.connect(user1).stake(stakeAmount);

    const sxtBalanceBefore = await sxtToken.balanceOf(user1.address);

    await expect(liquidStaking.connect(user1).unstake(stakeAmount))
      .to.emit(liquidStaking, 'Transfer') // ERC20 burn event
      .withArgs(
        user1.address,
        '0x0000000000000000000000000000000000000000',
        stakeAmount
      );

    const sxtBalanceAfter = await sxtToken.balanceOf(user1.address);

    expect(await liquidStaking.balanceOf(user1.address)).to.equal(0);
    expect(sxtBalanceAfter - sxtBalanceBefore).to.equal(stakeAmount);
  });

  it('should increase value of stSXT when rewards are added', async function () {
    const liquidStakingAddress = await liquidStaking.getAddress();
    const ownerAddress = owner.address;
    const user1Address = user1.address;

    await sxtToken.connect(user1).approve(liquidStakingAddress, stakeAmount);
    await liquidStaking.connect(user1).stake(stakeAmount);

    // Owner adds rewards to the pool
    const rewardAmount = ethers.parseEther('500');
    await sxtToken.transfer(ownerAddress, rewardAmount); // Ensure owner has tokens
    await sxtToken.connect(owner).approve(liquidStakingAddress, rewardAmount);
    await liquidStaking.connect(owner).addRewards(rewardAmount);

    // Exchange rate should increase
    const exchangeRate = await liquidStaking.exchangeRate();
    expect(exchangeRate).to.be.gt(ethers.parseEther('1'));

    // User1 stakes more and receives stSXT proportional to new rate
    const stakeAmount2 = ethers.parseEther('1000');
    await sxtToken.connect(user1).approve(liquidStakingAddress, stakeAmount2);
    await liquidStaking.connect(user1).stake(stakeAmount2);

    // Convert BigNumber results to BigInt for correct arithmetic
    const totalSupplyBefore = await liquidStaking.totalSupply();
    const totalSXTStakedBefore = await liquidStaking.totalSXTStaked();

    await sxtToken.connect(user1).approve(liquidStakingAddress, stakeAmount2);
    const tx = await liquidStaking.connect(user1).stake(stakeAmount2);

    const totalSupplyAfter = await liquidStaking.totalSupply();
    const totalSXTStakedAfter = await liquidStaking.totalSXTStaked();

    const mintedStSXT = totalSupplyAfter - totalSupplyBefore;
    const expectedMinted =
      (stakeAmount2 * totalSupplyBefore) / totalSXTStakedBefore;

    expect(mintedStSXT).to.equal(expectedMinted);
    expect(totalSXTStakedAfter).to.equal(totalSXTStakedBefore + stakeAmount2);
  });

  it('should allow transferring stSXT tokens', async function () {
    const liquidStakingAddress = await liquidStaking.getAddress();
    const user1Address = user1.address;
    const user2Address = user2.address;

    await sxtToken.connect(user1).approve(liquidStakingAddress, stakeAmount);
    await liquidStaking.connect(user1).stake(stakeAmount);

    await liquidStaking.connect(user1).transfer(user2Address, stakeAmount / 2n);

    expect(await liquidStaking.balanceOf(user1Address)).to.equal(
      stakeAmount / 2n
    );
    expect(await liquidStaking.balanceOf(user2Address)).to.equal(
      stakeAmount / 2n
    );
  });
});
