import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "@nomiclabs/hardhat-etherscan";

import { config as dotEnvConfig } from "dotenv";

dotEnvConfig();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        enabled: false,
      },
      chainId: 9998,
    },
    localhost: {
      chainId: 9998,
      forking: {
        url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        enabled: true,
      },
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      chainId: 97,
    },
    mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      chainId: 56,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
