"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Coins, RefreshCw } from "lucide-react"

interface Token {
  symbol: string
  name: string
  balance: string
  color: string
}

export function TokenSwap() {
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [fromToken, setFromToken] = useState<Token>({
    symbol: "STRADA",
    name: "Strada Token",
    balance: "1,250.00",
    color: "bg-blue-900 text-blue-300",
  })
  const [toToken, setToToken] = useState<Token>({
    symbol: "SXT",
    name: "Space and Time Token",
    balance: "850.00",
    color: "bg-purple-900 text-purple-300",
  })

  const tokens: Token[] = [
    {
      symbol: "STRADA",
      name: "Strada Token",
      balance: "1,250.00",
      color: "bg-blue-900 text-blue-300",
    },
    {
      symbol: "SXT",
      name: "Space and Time Token",
      balance: "850.00",
      color: "bg-purple-900 text-purple-300",
    },
    {
      symbol: "LSXT",
      name: "Liquid SXT Token",
      balance: "420.00",
      color: "bg-green-900 text-green-300",
    },
  ]

  const handleSwapTokens = () => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleAmountChange = (value: string) => {
    setFromAmount(value)

    // Special case for SXT to LSXT (1:1 ratio)
    if (
      (fromToken.symbol === "SXT" && toToken.symbol === "LSXT") ||
      (fromToken.symbol === "LSXT" && toToken.symbol === "SXT")
    ) {
      setToAmount(value)
    } else {
      // Simulate exchange rate calculation for other pairs
      const rate = 0.85 // Example rate
      setToAmount(value ? (Number.parseFloat(value) * rate).toFixed(6) : "")
    }
  }

  const handleSwap = () => {
    console.log(`Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`)
    setFromAmount("")
    setToAmount("")
  }

  const getExchangeRate = () => {
    if (
      (fromToken.symbol === "SXT" && toToken.symbol === "LSXT") ||
      (fromToken.symbol === "LSXT" && toToken.symbol === "SXT")
    ) {
      return "1:1"
    }
    return "1:0.85"
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-green-400" />
            <span>Token Swap</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Token */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">From</label>
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className={fromToken.color}>
                  {fromToken.symbol}
                </Badge>
                <span className="text-sm text-gray-400">Balance: {fromToken.balance}</span>
              </div>
              <Input
                value={fromAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.0"
                className="bg-gray-900 border-gray-600 text-white text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">{fromToken.name}</p>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSwapTokens}
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 rounded-full p-2"
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">To</label>
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className={toToken.color}>
                  {toToken.symbol}
                </Badge>
                <span className="text-sm text-gray-400">Balance: {toToken.balance}</span>
              </div>
              <Input
                value={toAmount}
                readOnly
                placeholder="0.0"
                className="bg-gray-900 border-gray-600 text-white text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">{toToken.name}</p>
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Exchange Rate</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  1 {fromToken.symbol} = {getExchangeRate().split(":")[1]} {toToken.symbol}
                </span>
                <RefreshCw className="w-3 h-3 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Special Notice for SXT/LSXT */}
          {((fromToken.symbol === "SXT" && toToken.symbol === "LSXT") ||
            (fromToken.symbol === "LSXT" && toToken.symbol === "SXT")) && (
            <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <p className="text-sm text-green-400">
                ✨ Special Rate: 1 {fromToken.symbol} = 1 {toToken.symbol}
              </p>
            </div>
          )}

          {/* Token Selection */}
          <div className="grid grid-cols-3 gap-2">
            {tokens.map((token) => (
              <Button
                key={token.symbol}
                onClick={() => {
                  if (token.symbol !== fromToken.symbol) {
                    setToToken(token)
                  }
                }}
                variant="outline"
                size="sm"
                className={`${token.color} border-gray-600 hover:bg-opacity-80`}
              >
                {token.symbol}
              </Button>
            ))}
          </div>

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            disabled={!fromAmount || !toAmount}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
          >
            <Coins className="w-4 h-4 mr-2" />
            Swap Tokens
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
