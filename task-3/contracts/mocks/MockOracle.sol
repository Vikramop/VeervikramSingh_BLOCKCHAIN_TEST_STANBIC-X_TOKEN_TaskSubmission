// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockOracle {
    bool public returnValue;

    function setReturnValue(bool val) public {
        returnValue = val;
    }

    function getSignal(bytes calldata) external view returns (bool) {
        return returnValue;
    }
}
