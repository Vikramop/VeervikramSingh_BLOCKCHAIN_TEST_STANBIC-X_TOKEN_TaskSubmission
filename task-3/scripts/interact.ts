// Script that interacts with a Greeter contract
import { ethers } from 'hardhat';
import { getWallet, LOCAL_RICH_WALLETS } from './utils';
import {
  getPaymasterParams,
  getGeneralPaymasterInput,
} from 'zksync-ethers/build/paymaster-utils';
import { hexlify, parseEther, toUtf8Bytes } from 'ethers';

// Address of the contract to interact with
const CONTRACT_ADDRESS = '0xE4a458F939e0c118CecA3B4b0A25ad2747eC1115';
// const CONTRACT_ADDRESS = '0x97376d9D52e453a3851938455A5A75Fe09fD1699';
// const TOKEN_ADDRESS = "0x4345C562c9556f8284036008ED2cE24C00b82c56";
if (!CONTRACT_ADDRESS)
  throw '⛔️ Provide address of the contract to interact with!';

async function main() {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  const wallet = getWallet();

  // (async () => {
  //   const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8011');
  //   const balance = await provider.getBalance(
  //     '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc'
  //   );
  //   console.log('Initial balance (ETH):', ethers.formatEther(balance));
  // })();

  console.log('Using wallet address:', wallet.address);

  // Check initial balance of the wallet
  console.log('Wallet balance:', ethers.formatEther(await wallet.getBalance()));

  // Check initial paymaster balance
  const paymasterBalance = await wallet.provider.getBalance(CONTRACT_ADDRESS);

  // adding money to paymaster contract
  // await (
  //   await wallet.sendTransaction({
  //     to: CONTRACT_ADDRESS,
  //     value: ethers.parseEther('0.0015'),
  //   })
  // ).wait();
  console.log('Paymaster Balance:', ethers.formatEther(paymasterBalance));

  console.log('bal before', (await wallet.getBalance()).toString());

  const tx = await wallet.sendTransaction({
    to: LOCAL_RICH_WALLETS[2].address,
    data: '0x69',
    // customData: {
    //   paymasterParams: getPaymasterParams(CONTRACT_ADDRESS, {
    //     type: 'General',
    //     innerInput: '0x',
    //   }),
    // },
  });

  console.log('bal after', (await wallet.getBalance()).toString());

  const resp = await tx.wait();

  console.log('Response', resp);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//  8835420775000000
//  8835420775000000

//  7331634450000000
//  7329406650000000
