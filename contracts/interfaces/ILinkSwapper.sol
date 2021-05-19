// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

interface ILinkSwapper {
  function setBeebitContract(address _newBeebit) external returns (bool);

  function getLinkAmountOut(uint256 _inputWBNB) external view returns (uint256);

  function getWBNBAmountIn(uint256 _linkAmount) external view returns (uint256);

  function swap(uint256 _deadline, uint256 _linkAmount)
    external
    payable
    returns (bool);

  function getPairAddress(address factory) external view returns (address pair);
}
