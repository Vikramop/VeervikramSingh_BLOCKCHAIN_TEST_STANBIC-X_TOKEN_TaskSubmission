// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Dummy {
    uint256 public value;
    event ValueChanged(uint256 newValue);

    function setValue(uint256 _value) external {
        value = _value;
        emit ValueChanged(_value);
    }
}
