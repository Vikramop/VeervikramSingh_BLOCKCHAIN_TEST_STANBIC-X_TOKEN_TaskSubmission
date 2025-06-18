import type { HardhatUserConfig } from 'hardhat/config';

import '@nomicfoundation/hardhat-chai-matchers';
import '@matterlabs/hardhat-zksync';

import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: 'abstractTestnet',
  networks: {
    abstractTestnet: {
      url: 'https://api.testnet.abs.xyz',
      ethNetwork: 'sepolia',
      zksync: true,
      accounts: process.env.WALLET_PRIVATE_KEY
        ? [process.env.WALLET_PRIVATE_KEY]
        : [],
      verifyURL:
        'https://api-explorer-verify.testnet.abs.xyz/contract_verification',
    },
    anvilZKsync: {
      url: 'http://127.0.0.1:8011',
      ethNetwork: 'http://localhost:8545',
      zksync: true,
      accounts: process.env.WALLET_PRIVATE_KEY
        ? [process.env.WALLET_PRIVATE_KEY]
        : [],
    },
    hardhat: {
      zksync: true,
    },
  },
  zksolc: {
    version: 'latest',
    settings: {
      codegen: 'yul',
      // find all available options in the official documentation
      // https://docs.zksync.io/build/tooling/hardhat/hardhat-zksync-solc#configuration
    },
  },
  solidity: {
    version: '0.8.24',
  },
};

export default config;
