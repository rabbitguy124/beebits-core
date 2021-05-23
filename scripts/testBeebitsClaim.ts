async function main(beebitsAddress: string) {
  /**
   * const cryptoBunks = await ethers.getContractAt(
    CRYPTOPUNKS_ABI,
    CRYPTOBUNKS_ADDRESS
  );
   * if (
    ![56, 97].includes(network.config.chainId) &&
    (await cryptoBunks.punkIndexToAddress("0")) !== owner.address
  ) {
    const BUNK_HOLDER = "0x71D09D0e606D1519804C6EFBd835d07DC4594227";
    console.log("Transferring Bunk to owner");
    await impersonateAddress(BUNK_HOLDER);
    const punkHolder = await ethers.getSigner(BUNK_HOLDER);
    await cryptoBunks.connect(punkHolder).transferPunk(owner.address, "0");
    await impersonateAddress(BUNK_HOLDER);
  }
   */
  // const expectedWBNBBalance = await lSwapper
  //   .connect(beebit.address)
  //   .getWBNBAmountIn(LINK_FEES);
  // console.log(beebit.address, lSwapper.address);
  // await beebit.setLinkSwapper(lSwapper.address);
  // console.log(
  //   "AMOUNT TO PAY FOR RANDOMNESS FEE",
  //   formatEther(expectedWBNBBalance)
  // );
  // const gasEstimate = await beebit.estimateGas.mintWithBunk(
  //   1,
  //   Math.floor(new Date().getTime() / 1000 + 3600),
  //   { value: expectedWBNBBalance }
  // );
  // console.log("GAS ESTIMATE", gasEstimate.toString());
  // const tx = await beebit.mintWithBunk(
  //   1,
  //   Math.floor(new Date().getTime() / 1000 + 3600),
  //   { value: expectedWBNBBalance }
  // );
  // const receipt = await tx.wait();
  // const gasPrice = tx.gasPrice;
  // const gasUsed = receipt.gasUsed;
  // const cGasUsed = receipt.cumulativeGasUsed;
  // console.log("GAS USED", gasUsed.toString());
  // console.log("CUMULATIVE GAS USED", cGasUsed.toString());
  // console.log("GAS PRICE", formatUnits(gasPrice, "gwei"));
  // console.log(`TOTAL FEE: `, gasEstimate.toString());
}

main("")
  .then(() => process.exit(0))
  .catch((err) => process.exit(1));
