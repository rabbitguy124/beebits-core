// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

/**
 * Minimal interface to Cryptobunks for verifying ownership during Community Grant.
 */
interface IBinanceBunksMarket {
  function punkIndexToAddress(uint256 index) external view returns (address);
}
