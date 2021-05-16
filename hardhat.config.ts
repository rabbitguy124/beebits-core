import "@nomiclabs/hardhat-ethers";
import { HardhatUserConfig } from "hardhat/config";
// import "@typechain/hardhat";

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
        url: "https://bsc.getblock.io/?api_key=ddac6183-e999-4f7e-99f6-465a49bedd6c",
      },
    },
    localhost: {
      timeout: 120000,
    },
  },
};

export default config;
