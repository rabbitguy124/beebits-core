import { run, ethers } from "hardhat";
import {
  CRYPTOPUNKS_ABI,
  CRYPTOBUNKS_ADDRESS,
  impersonateAddress,
} from "../utils";

async function main() {
  await run("compile");
  const owners = await ethers.getSigners();
  const cryptoPunks = await ethers.getContractAt(
    CRYPTOPUNKS_ABI,
    CRYPTOBUNKS_ADDRESS
  );

  for (let punkIndex = 0; punkIndex < 25; punkIndex++) {
    const address = await cryptoPunks.punkIndexToAddress(punkIndex);
    const receiver = owners[(punkIndex % 5) + 1].address;
    console.log(`
    SENDER - ${address}
    RECEIVER - ${receiver}`);
    await impersonateAddress(address);
    const addressSigner = await ethers.getSigner(address);
    await cryptoPunks.connect(addressSigner).transferPunk(receiver, punkIndex);
    console.log("Transfer of Bunk ID", punkIndex, "complete");
    // const addressSignerBalance = await addressSigner.getBalance();
    // console.log(`SENDING ${addressSignerBalance} BNB to ${receiver}`);
    // addressSigner.sendTransaction({
    //   from: addressSigner.address,
    //   to: receiver,
    //   gasPrice: 0,
    //   value: addressSignerBalance,
    // });
    await impersonateAddress(address, true);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
