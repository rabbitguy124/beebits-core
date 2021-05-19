// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./interfaces/ISwapRouterV2.sol";
import "./interfaces/ILINK.sol";
import "./interfaces/IPegSwap.sol";
import "./libraries/SafeMath.sol";

contract LinkSwapper {
  using SafeMath for uint256;

  ISwapRouterV2 private router;
  ILINK private LINK;
  IWLINK private WLINK = IWLINK(0x404460C6A5EdE2D891e8297795264fDe62ADBB75);
  IPegSwap private constant pegSwap =
    IPegSwap(0x1FCc3B22955e76Ca48bF025f1A6993685975Bb9e);

  address private beebitsAddress;
  address public deployer;
  address[] public swapPath = new address[](2);
  bool private isTesting;

  constructor(
    address _router,
    address _link,
    address _beebitsAddress,
    bool _isTesting
  ) {
    deployer = msg.sender;
    beebitsAddress = _beebitsAddress;
    router = ISwapRouterV2(_router);
    LINK = ILINK(_link);
    isTesting = _isTesting;
    swapPath[0] = router.WETH();
    swapPath[1] = address(_link);
  }

  modifier isBeebitCaller {
    require(
      msg.sender == address(beebitsAddress),
      "LinkSwapper: caller not beebit contract"
    );
    _;
  }

  function setBeebitContract(address _newBeebit) external returns (bool) {
    require(msg.sender == deployer, "LinkSwapper: caller not deployer");
    beebitsAddress = _newBeebit;
    return true;
  }

  function getLinkAmountOut(uint256 _inputWBNB)
    external
    view
    isBeebitCaller
    returns (uint256)
  {
    uint256[] memory amounts = router.getAmountsOut(_inputWBNB, swapPath);
    return amounts[1];
  }

  function getWBNBAmountIn(uint256 _linkAmount)
    external
    view
    isBeebitCaller
    returns (uint256)
  {
    uint256[] memory amounts = router.getAmountsIn(_linkAmount, swapPath);
    return amounts[0];
  }

  function swap(uint256 _deadline, uint256 _linkAmount)
    external
    payable
    isBeebitCaller
    returns (bool)
  {
    return
      isTesting
        ? _swapToLinkTest(_deadline, _linkAmount)
        : _swapToLinkMain(_deadline, _linkAmount);
  }

  function _swapToLinkTest(uint256 _deadline, uint256 _linkAmount)
    private
    returns (bool)
  {
    router.swapETHForExactTokens{value: msg.value}(
      _linkAmount,
      swapPath,
      beebitsAddress,
      _deadline
    );

    return true;
  }

  function _swapToLinkMain(uint256 _deadline, uint256 _linkAmount)
    private
    returns (bool)
  {
    router.swapETHForExactTokens{value: msg.value}(
      _linkAmount,
      swapPath,
      address(this),
      _deadline
    );

    LINK.approve(address(pegSwap), _linkAmount);
    pegSwap.swap(_linkAmount, address(LINK), address(WLINK));
    WLINK.transfer(deployer, WLINK.balanceOf(address(this)));
    return true;
  }

  function sortTokens(address tokenA, address tokenB)
    internal
    pure
    returns (address token0, address token1)
  {
    require(tokenA != tokenB, "LinkSwapper: IDENTICAL_ADDRESSES");
    (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    require(token0 != address(0), "LinkSwapper: ZERO_ADDRESS");
  }

  function getPairAddress(address factory)
    external
    view
    returns (address pair)
  {
    (address token0, address token1) = sortTokens(swapPath[0], swapPath[1]);
    pair = address(
      uint256(
        keccak256(
          abi.encodePacked(
            hex"ff",
            factory,
            keccak256(abi.encodePacked(token0, token1)),
            hex"d0d4c4cd0848c93cb4fd1f498d7013ee6bfb25783ea21593d5834f5d250ece66" // init code hash
          )
        )
      )
    );
  }
}
