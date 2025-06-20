const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('CryptoAIAgent', function () {
  let agent, oracle, owner, other;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();

    const MockOracle = await ethers.getContractFactory('MockOracle');
    oracle = await MockOracle.deploy();
    await oracle.waitForDeployment();

    const CryptoAIAgent = await ethers.getContractFactory('CryptoAIAgent');
    agent = await CryptoAIAgent.deploy(oracle.target);
    await agent.waitForDeployment();
  });

  it('should allow owner to execute action when oracle signal is true', async function () {
    await oracle.setReturnValue(true);
    await expect(agent.executeAction('buy', '0x'))
      .to.emit(agent, 'ActionExecuted')
      .withArgs(await agent.owner(), 'buy');
  });

  it('should revert if oracle signal is false', async function () {
    await oracle.setReturnValue(false);
    await expect(agent.executeAction('sell', '0x')).to.be.revertedWith(
      'Oracle signal false'
    );
  });

  it('should allow owner to update oracle', async function () {
    const newOracle = await (
      await ethers.getContractFactory('MockOracle')
    ).deploy();
    await newOracle.waitForDeployment();
    await agent.updateOracle(newOracle.target);
    expect(await agent.oracle()).to.equal(newOracle.target);
  });

  it('should revert non-owner updating oracle', async function () {
    const newOracle = await (
      await ethers.getContractFactory('MockOracle')
    ).deploy();
    await newOracle.waitForDeployment();
    await expect(
      agent.connect(other).updateOracle(newOracle.target)
    ).to.be.revertedWith('Not owner');
  });
});
