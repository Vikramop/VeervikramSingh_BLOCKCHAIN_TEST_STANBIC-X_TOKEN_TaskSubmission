"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface WalletConnectProps {
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export function WalletConnect({ isConnected, onConnect, onDisconnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  // Mock wallet data
  const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c"
  const balance = "1,234.56"

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    onConnect()
    setIsConnecting(false)
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
              <div className="text-xs text-gray-400">{balance} ETH</div>
            </div>
            <ChevronDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-gray-900 border-gray-700">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Smart Wallet</span>
            <Badge variant="secondary" className="bg-green-900 text-green-300">
              Connected
            </Badge>
          </div>
          <div className="text-xs text-gray-400 mb-3">Balance: {balance} ETH</div>
        </div>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem onClick={copyAddress} className="text-gray-300 hover:bg-gray-800">
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem onClick={onDisconnect} className="text-red-400 hover:bg-gray-800">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
