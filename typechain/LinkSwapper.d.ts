/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  PayableOverrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface LinkSwapperInterface extends ethers.utils.Interface {
  functions: {
    "deployer()": FunctionFragment;
    "getLinkAmountOut(uint256)": FunctionFragment;
    "getPairAddress(address)": FunctionFragment;
    "getWBNBAmountIn(uint256)": FunctionFragment;
    "swap(uint256,uint256)": FunctionFragment;
    "swapPath(uint256)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "deployer", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getLinkAmountOut",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getPairAddress",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getWBNBAmountIn",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "swap",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "swapPath",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "deployer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getLinkAmountOut",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPairAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getWBNBAmountIn",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "swapPath", data: BytesLike): Result;

  events: {};
}

export class LinkSwapper extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: LinkSwapperInterface;

  functions: {
    deployer(overrides?: CallOverrides): Promise<[string]>;

    getLinkAmountOut(
      _inputWBNB: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber]>;

    getPairAddress(
      factory: string,
      overrides?: CallOverrides
    ): Promise<[string] & { pair: string }>;

    getWBNBAmountIn(
      _linkAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber]>;

    swap(
      _deadline: BigNumberish,
      _linkAmount: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    swapPath(arg0: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
  };

  deployer(overrides?: CallOverrides): Promise<string>;

  getLinkAmountOut(
    _inputWBNB: BigNumberish,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber]>;

  getPairAddress(factory: string, overrides?: CallOverrides): Promise<string>;

  getWBNBAmountIn(
    _linkAmount: BigNumberish,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber]>;

  swap(
    _deadline: BigNumberish,
    _linkAmount: BigNumberish,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  swapPath(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  callStatic: {
    deployer(overrides?: CallOverrides): Promise<string>;

    getLinkAmountOut(
      _inputWBNB: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber]>;

    getPairAddress(factory: string, overrides?: CallOverrides): Promise<string>;

    getWBNBAmountIn(
      _linkAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber]>;

    swap(
      _deadline: BigNumberish,
      _linkAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    swapPath(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    deployer(overrides?: CallOverrides): Promise<BigNumber>;

    getLinkAmountOut(
      _inputWBNB: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPairAddress(
      factory: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getWBNBAmountIn(
      _linkAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    swap(
      _deadline: BigNumberish,
      _linkAmount: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    swapPath(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    deployer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getLinkAmountOut(
      _inputWBNB: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPairAddress(
      factory: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getWBNBAmountIn(
      _linkAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    swap(
      _deadline: BigNumberish,
      _linkAmount: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    swapPath(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}