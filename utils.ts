import { network } from "hardhat";

export async function impersonateAddress(address, shouldStop = false) {
  return shouldStop
    ? network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [address],
      })
    : network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [address],
      });
}

export const WLINK = "0x404460c6a5ede2d891e8297795264fde62adbb75";

export const FACTORY = {
  test: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
  main: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
};

export const VRF = {
  test: "0xa555fC018435bef5A13C6c6870a9d4C11DEC329C",
  main: "0x747973a5A2a4Ae1D3a8fDF5479f1514F65Db9C31",
};

export const NODE_HASH = {
  test: "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186",
  main: "0xc251acd21ec4fb7f31bb8868288bfdbaeb4fbfec2df3735ddbd4f7dc8d60103c",
};

export const LINK = {
  test: "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06",
  main: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
};

export const ROUTERS = {
  test: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
  main: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
};

export const CRYPTOBUNKS_ADDRESS_TEST =
  "0xf226dA899bA9aaA694E70C539C0B2FeC85474020";

export const CRYPTOPUNKS_ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "punksOfferedForSale",
    outputs: [
      { name: "isForSale", type: "bool" },
      { name: "punkIndex", type: "uint256" },
      { name: "seller", type: "address" },
      { name: "minValue", type: "uint256" },
      { name: "onlySellTo", type: "address" },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "punkIndex", type: "uint256" }],
    name: "enterBidForPunk",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "claimPrice",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "punkIndex", type: "uint256" },
      { name: "minPrice", type: "uint256" },
    ],
    name: "acceptBidForPunk",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "addresses", type: "address[]" },
      { name: "indices", type: "uint256[]" },
    ],
    name: "setInitialOwners",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "withdraw",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "imageHash",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "nextPunkIndexToAssign",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "punkIndexToAddress",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "standard",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "punkBids",
    outputs: [
      { name: "hasBid", type: "bool" },
      { name: "punkIndex", type: "uint256" },
      { name: "bidder", type: "address" },
      { name: "value", type: "uint256" },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "allInitialOwnersAssigned",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "allPunksAssigned",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "punkIndex", type: "uint256" }],
    name: "buyPunk",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "to", type: "address" },
      { name: "punkIndex", type: "uint256" },
    ],
    name: "transferPunk",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "punkIndex", type: "uint256" }],
    name: "withdrawBidForPunk",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "to", type: "address" },
      { name: "punkIndex", type: "uint256" },
    ],
    name: "setInitialOwner",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "getPunk",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "punkIndex", type: "uint256" },
      { name: "minSalePriceInWei", type: "uint256" },
      { name: "toAddress", type: "address" },
    ],
    name: "offerPunkForSaleToAddress",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "punksRemainingToAssign",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "punkIndex", type: "uint256" },
      { name: "minSalePriceInWei", type: "uint256" },
    ],
    name: "offerPunkForSale",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "pendingWithdrawals",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "punkIndex", type: "uint256" }],
    name: "punkNoLongerForSale",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    payable: true,
    stateMutability: "payable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "punkIndex", type: "uint256" },
    ],
    name: "Assign",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "punkIndex", type: "uint256" },
    ],
    name: "PunkTransfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "punkIndex", type: "uint256" },
      { indexed: false, name: "minValue", type: "uint256" },
      { indexed: true, name: "toAddress", type: "address" },
    ],
    name: "PunkOffered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "punkIndex", type: "uint256" },
      { indexed: false, name: "value", type: "uint256" },
      { indexed: true, name: "fromAddress", type: "address" },
    ],
    name: "PunkBidEntered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "punkIndex", type: "uint256" },
      { indexed: false, name: "value", type: "uint256" },
      { indexed: true, name: "fromAddress", type: "address" },
    ],
    name: "PunkBidWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "punkIndex", type: "uint256" },
      { indexed: false, name: "value", type: "uint256" },
      { indexed: true, name: "fromAddress", type: "address" },
      { indexed: true, name: "toAddress", type: "address" },
    ],
    name: "PunkBought",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "punkIndex", type: "uint256" }],
    name: "PunkNoLongerForSale",
    type: "event",
  },
];

export const CRYPTOBUNKS_ADDRESS = "0x5EA899dBc8d3CDE806142a955806e06759B05fB8";
