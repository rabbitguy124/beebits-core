import { parseEther } from "@ethersproject/units";
import { run, ethers, network } from "hardhat";
import {
  CRYPTOBUNKS_ADDRESS,
  CRYPTOPUNKS_ABI,
  impersonateAddress,
  LINK,
  NODE_HASH,
  ROUTERS,
  VRF,
  WLINK,
} from "../utils";

async function main() {
  await run("compile");
  const [owner] = await ethers.getSigners();

  const isTesting = [97, 9998].includes(network.config.chainId);
  const isNotLocal = [56, 97].includes(network.config.chainId);

  console.log("IS TESTNET", isTesting);

  const ROUTER_ADDRESS = isTesting ? ROUTERS.test : ROUTERS.main;
  const LINK_TOKEN = isTesting ? LINK.test : LINK.main;
  const WLINK_TOKEN = isTesting ? LINK.test : WLINK;
  const VRF_ADD = isTesting ? VRF.test : VRF.main;
  const NODE_HASH_ADD = isTesting ? NODE_HASH.test : NODE_HASH.main;
  const LINK_FEES = parseEther("1").div(isTesting ? 10 : 5);

  const Beebit = await ethers.getContractFactory("Beebits");
  const LinkSwapper = await ethers.getContractFactory("LinkSwapper");

  const beebit = await (
    await Beebit.deploy(
      CRYPTOBUNKS_ADDRESS,
      owner.address,
      WLINK_TOKEN,
      VRF_ADD,
      NODE_HASH_ADD,
      LINK_FEES,
      { gasLimit: 10000000 }
    )
  ).deployed();

  isNotLocal &&
    (await run("verify:verify", {
      address: beebit.address,
      constructorArguments: [
        CRYPTOBUNKS_ADDRESS,
        owner.address,
        WLINK_TOKEN,
        VRF_ADD,
        NODE_HASH_ADD,
        LINK_FEES,
      ],
    }));

  console.log("BEEBITS DEPLOYED AT", beebit.address);

  const linkSwapper = await (
    await LinkSwapper.deploy(
      ROUTER_ADDRESS,
      LINK_TOKEN,
      beebit.address,
      isTesting,
      {
        gasLimit: 10000000,
      }
    )
  ).deployed();

  console.log("LINKSWAPPER DEPLOYED AT", linkSwapper.address);

  isNotLocal &&
    (await run("verify:verify", {
      address: linkSwapper.address,
      constructorArguments: [
        ROUTER_ADDRESS,
        LINK_TOKEN,
        beebit.address,
        isTesting,
      ],
    }));

  await beebit.setLinkSwapper(linkSwapper.address);
  console.log("DEPLOY COMPLETE");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
