// Script that interacts with a Greeter contract
import { ethers } from 'hardhat';
import { getWallet, LOCAL_RICH_WALLETS } from './utils';
import {
  getPaymasterParams,
  getGeneralPaymasterInput,
} from 'zksync-ethers/build/paymaster-utils';
import { hexlify, parseEther, toUtf8Bytes } from 'ethers';

// Address of the contract to interact with
const CONTRACT_ADDRESS = '0x2B3c6D908854242665e9ce08f181E64891aA6402';
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
  console.log('Paymaster Balance:', ethers.formatEther(paymasterBalance));

  // adding money to paymaster contract
  await (
    await wallet.sendTransaction({
      to: CONTRACT_ADDRESS,
      value: ethers.parseEther('0.015'),
    })
  ).wait();

  console.log('bal before', (await wallet.getBalance()).toString());

  const tx = await wallet.sendTransaction({
    to: LOCAL_RICH_WALLETS[2].address,
    data: '0x69',
    customData: {
      paymasterParams: getPaymasterParams(CONTRACT_ADDRESS, {
        type: 'General',
        innerInput: '0x',
      }),
    },
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
