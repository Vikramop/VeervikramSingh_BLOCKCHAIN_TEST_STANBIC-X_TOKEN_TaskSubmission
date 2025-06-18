import * as hre from 'hardhat';
import { Provider, Wallet } from 'zksync-ethers';
import { Deployer } from '@matterlabs/hardhat-zksync';
import { ethers } from 'ethers';
import { vars } from 'hardhat/config';

import '@matterlabs/hardhat-zksync-node/dist/type-extensions';
import '@matterlabs/hardhat-zksync-verify/dist/src/type-extensions';

const PRIVATE_KEY_HARDHAT_CONFIGURATION_VARIABLE_NAME = 'WALLET_PRIVATE_KEY';

export const getProvider = () => {
  const rpcUrl = 'https://api.testnet.abs.xyz';
  if (!rpcUrl)
    throw `⛔️ RPC URL wasn't found in "${hre.network.name}"! Please add a "url" field to the network config in hardhat.config.ts`;

  // Initialize Abstract Provider
  const provider = new Provider(rpcUrl);

  return provider;
};

/**
 * Creates and returns a wallet instance.
 *
 * If a `privateKey` is provided, the wallet is initialized with that private key.
 * If no `privateKey` is provided, attempts to load the private key from Hardhat configuration variables.
 *
 * @param privateKey - Optional private key string used to initialize the wallet. If not provided, the private key is retrieved from Hardhat configuration variables.
 *                     For local development, use the RICH_WALLETS array to find private keys with funds on the local node.
 * @returns Wallet - A wallet instance initialized with the provided or configured private key and connected to the specified provider.
 * @throws Will throw an error if the private key cannot be found in the Hardhat configuration and none is provided.
 */
export const getWallet = (privateKey?: string) => {
  if (!privateKey) {
    const hardhatConfigPrivateKey = loadPrivateKeyFromHardhatConfig();
    privateKey = hardhatConfigPrivateKey;
  }

  const provider = getProvider();
  const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY, provider);

  return wallet;
};

/**
 * Verifies if the specified wallet has enough balance to cover a given amount.
 *
 * This function retrieves the balance of the provided wallet and compares it with the required amount.
 * If the wallet's balance is less than the required amount, an error is thrown with a message indicating
 * the shortfall.
 *
 * @param wallet - The `Wallet` instance whose balance is to be checked.
 * @param amount - The amount (in `bigint`) required to be available in the wallet.
 * @throws Will throw an error if the wallet's balance is less than the specified amount. The error message
 *         includes both the required amount and the current balance in ETH.
 */
export const verifyEnoughBalance = async (wallet: Wallet, amount: bigint) => {
  const balance = await wallet.getBalance();
  if (balance < amount)
    throw `⛔️ Wallet balance is too low! Required ${ethers.formatEther(
      amount
    )} ETH, but current ${wallet.address} balance is ${ethers.formatEther(
      balance
    )} ETH`;
};

/**
 * Verifies a contract on a blockchain using a given set of parameters.
 *
 * This function submits a contract verification request using Hardhat's `verify:verify` task.
 *
 * @param data - An object containing the contract verification parameters:
 *   - `address` (string): The address of the deployed contract to be verified.
 *   - `contract` (string): The path and name of the contract file, formatted as "contracts/MyPaymaster.sol:MyPaymaster".
 *   - `constructorArguments` (string): The constructor arguments used when deploying the contract, encoded as a string.
 *   - `bytecode` (string): The bytecode of the contract to be verified.
 *
 * @returns Promise<number> - The request ID of the verification request, which can be used to track the status of the verification.
 *
 * @throws Will throw an error if the verification request fails.
 */
export const verifyContract = async (data: {
  address: string;
  contract: string;
  constructorArguments: string;
  bytecode: string;
}) => {
  const verificationRequestId: number = await hre.run('verify:verify', {
    ...data,
    noCompile: true,
  });
  return verificationRequestId;
};

type DeployContractOptions = {
  /**
   * If true, the deployment process will not print any logs
   */
  silent?: boolean;
  /**
   * If true, the contract will not be verified on Block Explorer
   */
  noVerify?: boolean;
  /**
   * If specified, the contract will be deployed using this wallet
   */
  wallet?: Wallet;
};

/**
 * Deploys a contract to the blockchain and optionally verifies it.
 *
 *
 * @param contractArtifactName - The name of the contract artifact to be deployed. This should match the name used
 *                                when compiling the contract. E.g., "MyPaymaster".
 * @param constructorArguments - Optional arguments to be passed to the contract's constructor. These should be provided
 *                                as an array and are used when deploying the contract.
 * @param options - Optional deployment options:
 *   - `wallet` (Wallet): An optional wallet instance to be used for the deployment. If not provided, the getWallet() function
 *                        will be used.
 *   - `silent` (boolean): If `true`, suppresses logging messages.
 *   - `noVerify` (boolean): If `true`, skips the contract verification step after deployment.
 *
 * @returns Promise<Contract> - A promise that resolves to the deployed contract instance.
 *
 * @throws Will throw an error if:
 *   - The contract artifact cannot be found or loaded.
 *   - The wallet has insufficient balance for deployment.
 *   - Contract verification fails (if `noVerify` is not set to `true` and verification is requested).
 *
 * Example usage:
 * ```typescript
 * const contract = await deployContract("MyPaymaster");
 * ```
 */
export const deployContract = async (
  contractArtifactName: string,
  constructorArguments?: any[],
  options?: DeployContractOptions
) => {
  const log = (message: string) => {
    if (!options?.silent) console.log(message);
  };

  log(`\nStarting deployment process of "${contractArtifactName}"...`);

  const wallet = options?.wallet ?? getWallet();
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer
    .loadArtifact(contractArtifactName)
    .catch((error) => {
      if (
        error?.message?.includes(
          `Artifact for contract "${contractArtifactName}" not found.`
        )
      ) {
        console.error(error.message);
        throw `⛔️ Please make sure you have compiled your contracts or specified the correct contract name!`;
      } else {
        throw error;
      }
    });

  // Estimate contract deployment fee
  const deploymentFee = await deployer.estimateDeployFee(
    artifact,
    constructorArguments || []
  );
  log(`Estimated deployment cost: ${ethers.formatEther(deploymentFee)} ETH`);

  // Check if the wallet has enough balance
  await verifyEnoughBalance(wallet, deploymentFee);

  // Deploy the contract to Abstract
  const contract = await deployer.deploy(artifact, constructorArguments);
  const address = await contract.getAddress();
  const constructorArgs = contract.interface.encodeDeploy(constructorArguments);
  const fullContractSource = `${artifact.sourceName}:${artifact.contractName}`;

  // Display contract deployment info
  log(`\n"${artifact.contractName}" was successfully deployed:`);
  log(` - Contract address: ${address}`);
  log(` - Contract source: ${fullContractSource}`);
  log(` - Encoded constructor arguments: ${constructorArgs}\n`);

  if (!options?.noVerify && hre.network.config.verifyURL) {
    log(`Requesting contract verification...`);
    await verifyContract({
      address,
      contract: fullContractSource,
      constructorArguments: constructorArgs,
      bytecode: artifact.bytecode,
    });
  }

  // If abstractTestnet print explorer URL
  if (hre.network.name === 'abstractTestnet') {
    const explorerUrl = `https://explorer.testnet.abs.xyz`;
    log(
      `\n🔗 View your contract on the Abstract Block Explorer: ${explorerUrl}/address/${address}\n`
    );
  }

  return contract;
};

/**
 * Rich wallets can be used for testing purposes.
 * Available on the In-memory node and Dockerized node.
 */
export const LOCAL_RICH_WALLETS = [
  {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey:
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey:
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
  {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey:
      '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  },
  {
    address: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f ',
    privateKey:
      '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
  },
  {
    address: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
    privateKey:
      '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
  },
];

function loadPrivateKeyFromHardhatConfig() {
  try {
    return vars.get(PRIVATE_KEY_HARDHAT_CONFIGURATION_VARIABLE_NAME);
  } catch (error) {
    throw `⛔️ No Hardhat configuration variable found for WALLET_PRIVATE_KEY.
    Run npx hardhat vars set WALLET_PRIVATE_KEY
    and enter a new wallet's private key (do NOT use your mainnet wallet)!`;
  }
}
