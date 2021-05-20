import { formatEther, formatUnits, parseEther } from "@ethersproject/units";
import { run, ethers, network } from "hardhat";
import {
  CRYPTOBUNKS_ADDRESS,
  CRYPTOPUNKS_ABI,
  impersonateAddress,
  LINK,
  NODE_HASH,
  ROUTERS,
  VRF,
} from "../utils";

const LINK_FEES = parseEther("1").div(5);
const WLINK = "0x404460c6a5ede2d891e8297795264fde62adbb75";

async function main() {
  await run("compile");
  const [owner] = await ethers.getSigners();

  const cryptoBunks = await ethers.getContractAt(
    CRYPTOPUNKS_ABI,
    CRYPTOBUNKS_ADDRESS
  );

  if ((await cryptoBunks.punkIndexToAddress("0")) !== owner.address) {
    const BUNK_HOLDER = "0x71D09D0e606D1519804C6EFBd835d07DC4594227";
    console.log("Transferring Bunk to owner");
    await impersonateAddress(BUNK_HOLDER);
    const punkHolder = await ethers.getSigner(BUNK_HOLDER);
    await cryptoBunks.connect(punkHolder).transferPunk(owner.address, "0");
    await impersonateAddress(BUNK_HOLDER);
  }

  const Beebit = await ethers.getContractFactory("Beebits");
  const LinkSwapper = await ethers.getContractFactory("LinkSwapper");

  const beebit = await (
    await Beebit.deploy(
      CRYPTOBUNKS_ADDRESS,
      owner.address,
      WLINK,
      VRF.main,
      NODE_HASH.main,
      LINK_FEES
    )
  ).deployed();

  const lSwapper = await (
    await LinkSwapper.deploy(ROUTERS.main, LINK.main, beebit.address, false)
  ).deployed();

  const expectedWBNBBalance = await lSwapper
    .connect(beebit.address)
    .getWBNBAmountIn(LINK_FEES);

  console.log(beebit.address, lSwapper.address);

  await beebit.setLinkSwapper(lSwapper.address);

  console.log(
    "AMOUNT TO PAY FOR RANDOMNESS FEE",
    formatEther(expectedWBNBBalance)
  );

  const gasEstimate = await beebit.estimateGas.mintWithBunk(
    1,
    Math.floor(new Date().getTime() / 1000 + 3600),
    { value: expectedWBNBBalance }
  );

  console.log("GAS ESTIMATE", gasEstimate.toString());

  const tx = await beebit.mintWithBunk(
    1,
    Math.floor(new Date().getTime() / 1000 + 3600),
    { value: expectedWBNBBalance }
  );

  const receipt = await tx.wait();
  const gasPrice = tx.gasPrice;
  const gasUsed = receipt.gasUsed;
  const cGasUsed = receipt.cumulativeGasUsed;

  console.log("GAS USED", gasUsed.toString());
  console.log("CUMULATIVE GAS USED", cGasUsed.toString());
  console.log("GAS PRICE", formatUnits(gasPrice, "gwei"));
  console.log(`TOTAL FEE: `, gasEstimate.toString());
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
