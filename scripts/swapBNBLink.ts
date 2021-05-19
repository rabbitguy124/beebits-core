import { formatEther, parseEther } from "@ethersproject/units";
import { run, ethers } from "hardhat";
import { LinkSwapper } from "../typechain";

const ROUTERS = {
  test: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
  main: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
};

const FACTORY = {
  test: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
  main: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
};

const LINK = {
  test: "0x84b9b910527ad5c03a9ca831909e21e236ea7b06",
  main: "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd",
};

const WLINK = "0x404460c6a5ede2d891e8297795264fde62adbb75";

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
    true,
    LINK.test
  );

  await LINKTOKEN.deployed();

  await linkSwapper.deployed();

  const [amount13] = await linkSwapper.getWBNBAmountIn(parseEther("1").div(5));

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
