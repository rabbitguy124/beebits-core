import { formatEther, parseEther } from "@ethersproject/units";
import { run, ethers } from "hardhat";
import { LinkSwapper } from "../typechain";
import { LINK, WLINK, ROUTERS, FACTORY } from "../utils";

async function main() {
  await run("compile");
  const [deployer] = await ethers.getSigners();
  const LinkSwapper = await ethers.getContractFactory("LinkSwapper");
  const LINKTOKEN = await ethers.getContractAt(
    [
      "function balanceOf(address owner) external view returns (uint256 balance)",
    ],
    LINK.test
  );

  const WLINKTOKEN = await ethers.getContractAt(
    [
      "function balanceOf(address owner) external view returns (uint256 balance)",
    ],
    WLINK
  );

  const linkSwapper: LinkSwapper = await LinkSwapper.deploy(
    ROUTERS.test,
    LINK.test,
    "ad",
    true
  );

  await LINKTOKEN.deployed();

  await linkSwapper.deployed();

  const amount13 = await linkSwapper.getWBNBAmountIn(parseEther("1").div(5));

  console.log(
    "LINK Balance of contract",
    formatEther(await LINKTOKEN.balanceOf(linkSwapper.address))
  );

  console.log(formatEther(amount13));

  console.log(await linkSwapper.getPairAddress(FACTORY.test));
  await linkSwapper.swap(
    Math.floor(new Date().getTime() / 1000) + 3600,
    parseEther("1").div(5),
    {
      value: amount13,
    }
  );

  // console.log(formatEther(await WLINKTOKEN.balanceOf(deployer.address)));
  // console.log(formatEther(await WLINKTOKEN.balanceOf(deployer.address)));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
