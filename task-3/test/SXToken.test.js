// test/SXToken.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('SXToken', function () {
  let SXT, BLX, STRADA, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    // Deploy dependencies
    const BLXToken = await ethers.getContractFactory('BLXToken');
    BLX = await BLXToken.deploy(ethers.parseEther('1000000'));

    const STRADAToken = await ethers.getContractFactory('STRADAToken');
    STRADA = await STRADAToken.deploy(ethers.parseEther('1000000'));

    // Deploy SXT
    const SXToken = await ethers.getContractFactory('SXToken');
    SXT = await SXToken.deploy(
      BLX.target,
      STRADA.target,
      ethers.parseEther('1000000')
    );

    // Fund user
    await BLX.transfer(user.address, ethers.parseEther('1000'));
    await STRADA.transfer(user.address, ethers.parseEther('1000'));
  });

  it('Should mint SXT 1:1 for collateral', async () => {
    await BLX.connect(user).approve(SXT.target, ethers.parseEther('100'));
    await STRADA.connect(user).approve(SXT.target, ethers.parseEther('100'));

    await SXT.connect(user).depositCollateral(
      ethers.parseEther('100'),
      ethers.parseEther('100')
    );

    expect(await SXT.balanceOf(user.address)).to.equal(
      ethers.parseEther('100')
    );
  });

  it('Should prevent unequal collateral deposits', async () => {
    await expect(
      SXT.connect(user).depositCollateral(
        ethers.parseEther('100'),
        ethers.parseEther('90')
      )
    ).to.be.revertedWith('SXT: Collateral ratio mismatch');
  });
});
