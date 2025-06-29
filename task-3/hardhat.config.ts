import type { HardhatUserConfig } from 'hardhat/config';
import '@matterlabs/hardhat-zksync';

import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: 'abstractTestnet',
  networks: {
    abstractTestnet: {
      url: 'https://sepolia.era.zksync.dev',
      ethNetwork: 'sepolia',
      zksync: true,
      // chainId: 300,
      accounts: process.env.WALLET_PRIVATE_KEY
        ? [process.env.WALLET_PRIVATE_KEY]
        : [],
      verifyURL:
        'https://explorer.sepolia.era.zksync.dev/contract_verification',
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
    version: '1.5.15',
    settings: {
      codegen: 'yul',
      // find all available options in the official documentation
      // https://docs.zksync.io/build/tooling/hardhat/hardhat-zksync-solc#configuration
    },
  },
  solidity: {
    version: '0.8.24',
  },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY, // for contract verification
  // },
};

export default config;
