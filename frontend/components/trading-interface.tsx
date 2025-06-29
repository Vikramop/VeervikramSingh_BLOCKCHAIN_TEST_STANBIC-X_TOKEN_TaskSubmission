"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, TrendingUp, Target, Shield } from "lucide-react"

interface Trade {
  id: string
  token: string
  type: "buy" | "sell"
  amount: string
  price: string
  stopLoss: string
  takeProfit: string
  status: "active" | "completed" | "stopped"
  timestamp: Date
}

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

export function TradingInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        'Hello! I\'m your AI trading assistant. I can help you set up trades with stop-loss and take-profit orders. Try saying something like "Buy 100 USDC worth of ETH with 5% stop loss and 15% take profit"',
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [activeTrades, setActiveTrades] = useState<Trade[]>([
    {
      id: "1",
      token: "ETH",
      type: "buy",
      amount: "0.5",
      price: "2,450.00",
      stopLoss: "2,327.50",
      takeProfit: "2,817.50",
      status: "active",
      timestamp: new Date(),
    },
    {
      id: "2",
      token: "BTC",
      type: "buy",
      amount: "0.01",
      price: "43,200.00",
      stopLoss: "40,000.00",
      takeProfit: "50,000.00",
      status: "active",
      timestamp: new Date(),
    },
  ])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)

    setInputMessage("")
  }

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("buy") || lowerInput.includes("sell")) {
      return "I've analyzed your trade request. Based on current market conditions, I recommend setting a stop-loss at 5% below entry and take-profit at 12% above entry. Would you like me to execute this trade?"
    }

    if (lowerInput.includes("market") || lowerInput.includes("price")) {
      return "Current market analysis shows moderate volatility. ETH is trending upward with strong support at $2,400. BTC is consolidating around $43,000. What would you like to trade?"
    }

    return "I can help you with trading strategies, market analysis, and setting up automated trades with stop-loss and take-profit orders. What would you like to know?"
  }

  const closeTrade = (tradeId: string) => {
    setActiveTrades((prev) =>
      prev.map((trade) => (trade.id === tradeId ? { ...trade, status: "completed" as const } : trade)),
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* AI Chat Interface */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <span>AI Trading Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-80 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about trades, market analysis, or strategies..."
              className="bg-gray-800 border-gray-700 text-white"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Trades */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span>Active Trades</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-4">
              {activeTrades.map((trade) => (
                <div key={trade.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={trade.type === "buy" ? "default" : "destructive"}
                        className={trade.type === "buy" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}
                      >
                        {trade.type.toUpperCase()}
                      </Badge>
                      <span className="font-semibold">{trade.token}</span>
                    </div>
                    <Badge
                      variant={trade.status === "active" ? "default" : "secondary"}
                      className={trade.status === "active" ? "bg-blue-900 text-blue-300" : "bg-gray-700 text-gray-300"}
                    >
                      {trade.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="font-medium">
                        {trade.amount} {trade.token}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Entry Price</p>
                      <p className="font-medium">${trade.price}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-red-400" />
                      <div>
                        <p className="text-gray-400">Stop Loss</p>
                        <p className="font-medium text-red-400">${trade.stopLoss}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-green-400" />
                      <div>
                        <p className="text-gray-400">Take Profit</p>
                        <p className="font-medium text-green-400">${trade.takeProfit}</p>
                      </div>
                    </div>
                  </div>

                  {trade.status === "active" && (
                    <Button
                      onClick={() => closeTrade(trade.id)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    >
                      Close Trade
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
