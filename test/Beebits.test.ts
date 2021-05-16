import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { CRYPTOBUNKS_ADDRESS, CRYPTOPUNKS_ABI } from "../utils";

chai.use(solidity);
const { expect } = chai;

describe("Beebits tests", async () => {
  let Beebits;
  let beebitsInstance;
  let cryptoBunksInstance;

  let deployer;
  let owner1: SignerWithAddress;
  let owner2: SignerWithAddress;
  let owner3: SignerWithAddress;
  let owner4: SignerWithAddress;
  let owner5: SignerWithAddress;
  let beneficiary: SignerWithAddress;
  let nonOwner: SignerWithAddress;
  let others: SignerWithAddress[];

  beforeEach(async () => {
    Beebits = await ethers.getContractFactory("Beebits");
    [
      deployer,
      owner1,
      owner2,
      owner3,
      owner4,
      owner5,
      beneficiary,
      nonOwner,
      ...others
    ] = await ethers.getSigners();

    beebitsInstance = await Beebits.deploy(
      CRYPTOBUNKS_ADDRESS,
      beneficiary.address
    );

    cryptoBunksInstance = await ethers.getContractAt(
      CRYPTOPUNKS_ABI,
      CRYPTOBUNKS_ADDRESS
    );

    console.log(`Beebits deployed at ${beebitsInstance.address}`);
  });

  describe("Minting tests", () => {
    it("should mint a beebit for a bunk holder", async () => {
      const owner1Ins = beebitsInstance.connect(owner1);
      await owner1Ins.mintWithBunk(6);
      expect((await beebitsInstance.creatorNftMints(6)).toString()).eq("1");
    });

    it("should mint multiple beebits if held multiple bunks by a person", async () => {
      const owner2Ins = beebitsInstance.connect(owner2);
      await owner2Ins.mintWithBunk(7);
      await owner2Ins.mintWithBunk(12);
      await owner2Ins.mintWithBunk(17);
      await owner2Ins.mintWithBunk(22);
      expect((await beebitsInstance.creatorNftMints(7)).toString()).eq("1");
      expect((await beebitsInstance.creatorNftMints(12)).toString()).eq("1");
      expect((await beebitsInstance.creatorNftMints(17)).toString()).eq("1");
      expect((await beebitsInstance.creatorNftMints(22)).toString()).eq("1");
    });

    it("should fail when trying to mint the same bunk", async () => {
      const owner1Ins = beebitsInstance.connect(owner1);
      await owner1Ins.mintWithBunk(6);
      expect((await beebitsInstance.creatorNftMints(6)).toString()).eq("1");
      await expect(owner1Ins.mintWithBunk(6)).to.be.reverted;
    });

    it("should not accept a punk once a beebit with that is minted", async () => {
      const owner1Ins = beebitsInstance.connect(owner1);
      await owner1Ins.mintWithBunk(11);
      expect((await beebitsInstance.creatorNftMints(11)).toString()).eq("1");

      await cryptoBunksInstance
        .connect(owner1)
        .transferPunk(owner5.address, 10);
      await expect(beebitsInstance.connect(owner5).mintWithBunk(11)).to.be
        .reverted;
      await cryptoBunksInstance
        .connect(owner5)
        .transferPunk(owner1.address, 10);
    });

    it("should not mint for a punk that is no longer thyselves", async () => {
      const owner2Ins = beebitsInstance.connect(owner2);
      await cryptoBunksInstance.connect(owner2).transferPunk(owner3.address, 1);
      await expect(owner2Ins.mintWithBunk(2)).to.be.reverted;
    });
  });
});
