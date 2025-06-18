// Script that deploys a given contract to a network
import { ethers, run } from 'hardhat';
import hre from 'hardhat';
import * as MyPaymasterArtifact from '../artifacts-zk/contracts/MyPaymaster.sol/MyPaymaster.json';
import { getWallet } from './utils';

const wallet = getWallet();
async function main() {
  // Get the first signer (deployer)
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      'No signer found. Ensure Hardhat network is configured correctly.'
    );
  }

  console.log('Deploying contract with account:', deployer.address);
  console.log('bal before', (await wallet.getBalance()).toString());
  // // Get the contract factory and deploy
  // const factory = new ethers.ContractFactory(
  //   MyPaymasterArtifact.abi,
  //   MyPaymasterArtifact.bytecode,
  //   deployer
  // );
  // const myPaymaster = await factory.deploy();

  // console.log('Transaction sent. Waiting for deployment...');
  // await myPaymaster.deploymentTransaction()?.wait(); // Wait for the deployment transaction to be mined

  // console.log('MyPaymaster deployed to:', myPaymaster.target); // contract.target contains the deployed address

  // console.log('Verifying contract...');
  // await run('verify:verify', {
  //   address: myPaymaster.target,
  //   constructorArguments: [],
  // });

  // Define initial parameters
  const initialSupply = ethers.parseUnits('1000000', 18); // 1M tokens
  const rewardRate = ethers.parseUnits('10', 18); // Reward rate for staking

  // 1. Deploy BLX Token (Mock for demonstration)
  console.log('Deploying BLX Token...');
  const BLXToken = await hre.ethers.getContractFactory('BLXToken');
  const blxToken = await BLXToken.deploy(initialSupply);
  console.log('BLX Token deployed to:', blxToken.target);

  // 2. Deploy STRADA Token
  console.log('Deploying STRADA Token...');
  const STRADAToken = await hre.ethers.getContractFactory('STRADAToken');
  const stradaToken = await STRADAToken.deploy(initialSupply);
  console.log('STRADA Token deployed to:', stradaToken.target);

  // 3. Deploy SXToken
  console.log('Deploying SXToken...');
  const SXToken = await hre.ethers.getContractFactory('SXToken');
  const sxToken = await SXToken.deploy(
    blxToken.target,
    stradaToken.target,
    initialSupply
  );
  console.log('SXToken deployed to:', sxToken.target);

  // 4. Deploy WSXToken
  console.log('Deploying WSXToken...');
  const WSXToken = await hre.ethers.getContractFactory('WSXToken');
  const wsxToken = await WSXToken.deploy(sxToken.target);
  console.log('WSXToken deployed to:', wsxToken.target);

  // 5. Deploy StanbicXLiquidStaking
  console.log('Deploying StanbicXLiquidStaking...');
  const StanbicXLiquidStaking = await hre.ethers.getContractFactory(
    'StanbicXLiquidStaking'
  );
  const stakingContract = await StanbicXLiquidStaking.deploy(
    sxToken.target,
    blxToken.target,
    rewardRate
  );
  console.log('StanbicXLiquidStaking deployed to:', stakingContract.target);

  // Log deployed contract addresses
  console.log('\nDeployed Contracts:');
  console.log(`BLX Token: ${blxToken.target}`);
  console.log(`STRADA Token: ${stradaToken.target}`);
  console.log(`SXToken: ${sxToken.target}`);
  console.log(`WSXToken: ${wsxToken.target}`);
  console.log(`StanbicXLiquidStaking: ${stakingContract.target}`);
  console.log('Verifying contract...');
  // await run('verify:verify', {
  //   address: myPaymaster.target,
  //   constructorArguments: [],
  // });
  const contractsToVerify = [
    {
      name: 'BLXToken',
      address: blxToken.target,
      args: [ethers.parseEther('1000000')],
    },
    {
      name: 'STRADAToken',
      address: stradaToken.target,
      args: [ethers.parseEther('1000000')],
    },
    {
      name: 'SXToken',
      address: sxToken.target,
      args: [blxToken.target, stradaToken.target, ethers.parseEther('1000000')],
    },
    {
      name: 'WSXToken',
      address: wsxToken.target,
      args: [sxToken.target],
    },
    {
      name: 'StanbicXLiquidStaking',
      address: stakingContract.target,
      args: [sxToken.target, blxToken.target, rewardRate],
    },
  ];

  for (const contract of contractsToVerify) {
    try {
      console.log(
        `Verifying ${contract.name} at address: ${contract.address}...`
      );
      await run('verify:verify', {
        address: contract.address,
        constructorArguments: contract.args,
      });
      console.log(`${contract.name} verified successfully!`);
    } catch (error) {
      console.error(
        `Verification of ${contract.name} at address ${contract.address} failed:`,
        error.message || error
      );
    }
  }

  console.log('Contract verified!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
