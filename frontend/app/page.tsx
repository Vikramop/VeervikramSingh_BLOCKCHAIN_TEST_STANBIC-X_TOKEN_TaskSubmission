"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { WalletConnect } from "@/components/wallet-connect"
import { TradingInterface } from "@/components/trading-interface"
import { WrappingInterface } from "@/components/wrapping-interface"
import { TokenSwap } from "@/components/token-swap"
import { Bot, TrendingUp, Repeat, Coins } from "lucide-react"

export default function TradingApp() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              DeFi Trading Hub
            </h1>
          </div>
          <WalletConnect
            isConnected={isWalletConnected}
            onConnect={() => setIsWalletConnected(true)}
            onDisconnect={() => setIsWalletConnected(false)}
          />
        </div>

        {/* Main Content */}
        {!isWalletConnected ? (
          <Card className="bg-gray-900 border-gray-800 p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Connect Your Smart Wallet</h2>
              <p className="text-gray-400 mb-6">
                Connect your Alchemy Smart Wallet to start trading, wrapping tokens, and managing your portfolio.
              </p>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="trading" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-800">
              <TabsTrigger
                value="trading"
                className="flex items-center space-x-2 data-[state=active]:bg-gray-800 data-[state=active]:text-blue-400"
              >
                <Bot className="w-4 h-4" />
                <span>AI Trading</span>
              </TabsTrigger>
              <TabsTrigger
                value="wrapping"
                className="flex items-center space-x-2 data-[state=active]:bg-gray-800 data-[state=active]:text-purple-400"
              >
                <Repeat className="w-4 h-4" />
                <span>Wrap/Peg</span>
              </TabsTrigger>
              <TabsTrigger
                value="tokens"
                className="flex items-center space-x-2 data-[state=active]:bg-gray-800 data-[state=active]:text-green-400"
              >
                <Coins className="w-4 h-4" />
                <span>Token Swap</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trading">
              <TradingInterface />
            </TabsContent>

            <TabsContent value="wrapping">
              <WrappingInterface />
            </TabsContent>

            <TabsContent value="tokens">
              <TokenSwap />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
