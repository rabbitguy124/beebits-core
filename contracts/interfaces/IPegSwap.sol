// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

interface IPegSwap {
  function swap(
    uint256 amount,
    address source,
    address target
  ) external;
}
