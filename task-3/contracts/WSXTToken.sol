// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ISXToken {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract WSXToken is ERC20, ReentrancyGuard {
    ISXToken public sxtToken;

    constructor(address _sxtAddress) ERC20("Wrapped SXT", "wSXT") {
        sxtToken = ISXToken(_sxtAddress);
    }

    // Wrap SXT to wSXT
    function wrap(uint256 amount) external nonReentrant {
        require(amount > 0, "wSXT: Amount must be > 0");
        sxtToken.transferFrom(msg.sender, address(this), amount);
        _mint(msg.sender, amount);
        emit Wrap(msg.sender, amount);
    }

    // Unwrap wSXT to SXT
    function unwrap(uint256 amount) external nonReentrant {
        require(amount > 0, "wSXT: Amount must be > 0");
        _burn(msg.sender, amount);
        sxtToken.transfer(msg.sender, amount);
        emit Unwrap(msg.sender, amount);
    }

    event Wrap(address indexed user, uint256 amount);
    event Unwrap(address indexed user, uint256 amount);
}
