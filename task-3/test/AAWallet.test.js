const chai = require('chai');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('AAWallet', function () {
  let wallet, owner, attacker, other;

  beforeEach(async function () {
    [owner, attacker, other] = await ethers.getSigners();
    const AAWallet = await ethers.getContractFactory('AAWallet');
    wallet = await AAWallet.deploy(owner.address);
    await wallet.waitForDeployment();
  });

  it('should set the correct owner', async function () {
    expect(await wallet.owner()).to.equal(owner.address);
  });

  it('should validate correct signature', async function () {
    // Compute hash using ethers v6 utilities
    const userOpHash = ethers.keccak256(ethers.toUtf8Bytes('userOp'));
    const signature = await owner.signMessage(ethers.getBytes(userOpHash));

    // Call validateUserOp
    const validation = await wallet.validateUserOp(
      {
        sender: wallet.target,
        nonce: 0,
        initCode: '0x',
        callData: '0x',
        callGasLimit: 0,
        verificationGasLimit: 0,
        preVerificationGas: 0,
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        paymasterAndData: '0x',
        signature: signature,
      },
      userOpHash,
      0
    );
    expect(validation).to.equal(0n);
  });

  it('should revert on invalid signature', async function () {
    const userOpHash = ethers.keccak256(ethers.toUtf8Bytes('userOp'));
    const badSignature = await attacker.signMessage(
      ethers.getBytes(userOpHash)
    );

    await expect(
      wallet.validateUserOp(
        {
          sender: wallet.target,
          nonce: 0,
          initCode: '0x',
          callData: '0x',
          callGasLimit: 0,
          verificationGasLimit: 0,
          preVerificationGas: 0,
          maxFeePerGas: 0,
          maxPriorityFeePerGas: 0,
          paymasterAndData: '0x',
          signature: badSignature,
        },
        userOpHash,
        0
      )
    ).to.be.revertedWith('Invalid signature');
  });

  it('should execute calls from owner', async function () {
    // Deploy a dummy contract to call
    const Dummy = await ethers.getContractFactory('Dummy');
    const dummy = await Dummy.deploy();
    await dummy.waitForDeployment();

    // Encode call data
    const callData = dummy.interface.encodeFunctionData('setValue', [42]);

    // Execute call
    await expect(wallet.execute(dummy.target, callData))
      .to.emit(dummy, 'ValueChanged')
      .withArgs(42);
  });

  it('should revert execute if called by non-owner or non-wallet', async function () {
    const Dummy = await ethers.getContractFactory('Dummy');
    const dummy = await Dummy.deploy();
    await dummy.waitForDeployment();

    const callData = dummy.interface.encodeFunctionData('setValue', [42]);

    // Attacker tries to call wallet.execute, should revert
    await expect(
      wallet.connect(attacker).execute(dummy.target, callData)
    ).to.be.revertedWith('Unauthorized');
  });
});
