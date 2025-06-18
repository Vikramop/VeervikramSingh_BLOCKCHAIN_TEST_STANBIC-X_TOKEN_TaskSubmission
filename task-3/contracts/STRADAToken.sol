// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract STRADAToken is ERC20, Ownable {
    uint256 public maxTxAmount;
    uint256 public cooldownTime = 60; // 60 seconds cooldown
    mapping(address => uint256) private lastTxTime;

    // testing purpose
    mapping(address => bool) private _isExcludedFromCooldown;
    mapping(address => bool) private _isExcludedFromMaxTx;

    constructor(
        uint256 initialSupply
    ) Ownable(msg.sender) ERC20("STRADA Token", "STRADA") {
        _mint(msg.sender, initialSupply);
        maxTxAmount = initialSupply / 100; // 1% of initial supply (with decimals)

        // testing purpose
        _isExcludedFromCooldown[msg.sender] = true;
        _isExcludedFromMaxTx[msg.sender] = true;
    }

    modifier antiWhale(address sender, uint256 amount) {
        if (!_isExcludedFromMaxTx[sender]) {
            require(
                amount <= maxTxAmount,
                "STRADA: Transfer amount exceeds maxTxAmount"
            );
        }
        _;
    }

    modifier antiBot(address sender) {
        if (!_isExcludedFromCooldown[sender]) {
            require(
                block.timestamp - lastTxTime[sender] >= cooldownTime,
                "STRADA: Please wait before making another transaction"
            );
            _;
            lastTxTime[sender] = block.timestamp;
        } else {
            _; // Skip cooldown check for excluded addresses
        }
    }

    function transfer(
        address to,
        uint256 amount
    )
        public
        override
        antiWhale(msg.sender, amount)
        antiBot(msg.sender)
        returns (bool)
    {
        return super.transfer(to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override antiWhale(from, amount) antiBot(from) returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function setMaxTxAmount(uint256 newMaxTxAmount) external onlyOwner {
        maxTxAmount = newMaxTxAmount;
    }

    function setCooldownTime(uint256 newCooldownTime) external onlyOwner {
        cooldownTime = newCooldownTime;
    }

    function setCooldownExcluded(
        address account,
        bool excluded
    ) external onlyOwner {
        _isExcludedFromCooldown[account] = excluded;
    }
}
