// Script that deploys a given contract to a network
import { ethers, network } from 'hardhat';
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
  // Get the contract factory and deploy
  const factory = new ethers.ContractFactory(
    MyPaymasterArtifact.abi,
    MyPaymasterArtifact.bytecode,
    deployer
  );
  const contract = await factory.deploy();

  console.log('Transaction sent. Waiting for deployment...');
  await contract.deploymentTransaction()?.wait(); // Wait for the deployment transaction to be mined

  console.log('MyPaymaster deployed to:', contract.target); // contract.target contains the deployed address
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
