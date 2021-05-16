import { formatEther } from "@ethersproject/units";
import "@nomiclabs/hardhat-ethers";
import { ethers, run } from "hardhat";
import { impersonateAddress } from "../utils";

async function main() {
  await run("compile");
  await impersonateAddress("0x2Dfe8259e14B591D63a02Ad810CD502C29d56292");
  const me = ethers.provider.getSigner(
    "0x2Dfe8259e14B591D63a02Ad810CD502C29d56292"
  );
  console.log(formatEther(await me.getBalance()));
  await impersonateAddress("0x2Dfe8259e14B591D63a02Ad810CD502C29d56292", true);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
