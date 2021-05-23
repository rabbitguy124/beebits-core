import { ethers, network, run } from "hardhat";
import { BinancePunksMarket } from "../typechain/BinancePunksMarket";

async function main() {
  await run("compile");
  const [deployer, ...owners] = (await ethers.getSigners()).slice(0, 11);

  console.log("OWNERS", owners.length);

  const BinancePunks = await ethers.getContractFactory("BinancePunksMarket");
  const binancePunks = (await (
    await BinancePunks.connect(deployer).deploy()
  ).deployed()) as BinancePunksMarket;

  console.log("BINANCE PUNKS DEPLOYED AT", binancePunks.address);

  await binancePunks.setInitialOwners(
    Array.from(
      { length: 100 },
      () => "0x7271272BA301B20CFD35bD36872Cb3E2807B231A"
    ),
    Array.from({ length: 100 }, (_, i) => i),
    { gasLimit: 10_000_000 }
  );

  for (let index = 1; index < 100; index++) {
    await binancePunks.setInitialOwners(
      Array.from({ length: 100 }, () => owners[index % 10].address),
      Array.from({ length: 100 }, (_, i) => i + 100 * index),
      { gasLimit: 10_000_000 }
    );
  }

  await binancePunks.allInitialOwnersAssigned();

  [56, 97].includes(network.config.chainId) &&
    (await run("verify:verify", {
      address: binancePunks.address,
    }));

  console.log("BINANCE PUNKS DEPLOYED");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
