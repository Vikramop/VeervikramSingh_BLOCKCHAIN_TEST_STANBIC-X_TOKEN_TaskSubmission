"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpDown, Repeat, Package, Unlink } from "lucide-react"

export function WrappingInterface() {
  const [wrapAmount, setWrapAmount] = useState("")
  const [unwrapAmount, setUnwrapAmount] = useState("")
  const [pegAmount, setPegAmount] = useState("")
  const [unpegAmount, setUnpegAmount] = useState("")

  const handleWrap = () => {
    console.log("Wrapping", wrapAmount, "ETH to WETH")
    setWrapAmount("")
  }

  const handleUnwrap = () => {
    console.log("Unwrapping", unwrapAmount, "WETH to ETH")
    setUnwrapAmount("")
  }

  const handlePeg = () => {
    console.log("Pegging", pegAmount, "tokens")
    setPegAmount("")
  }

  const handleUnpeg = () => {
    console.log("Unpegging", unpegAmount, "tokens")
    setUnpegAmount("")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="wrap" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-800">
          <TabsTrigger value="wrap" className="data-[state=active]:bg-gray-800 data-[state=active]:text-purple-400">
            <Package className="w-4 h-4 mr-2" />
            Wrap/Unwrap
          </TabsTrigger>
          <TabsTrigger value="peg" className="data-[state=active]:bg-gray-800 data-[state=active]:text-blue-400">
            <Unlink className="w-4 h-4 mr-2" />
            Peg/Unpeg
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wrap">
          <div className="grid gap-6">
            {/* Wrap ETH to WETH */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowUpDown className="w-5 h-5 text-purple-400" />
                  <span>Wrap ETH</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Amount to Wrap</label>
                  <div className="flex space-x-2">
                    <Input
                      value={wrapAmount}
                      onChange={(e) => setWrapAmount(e.target.value)}
                      placeholder="0.0"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 px-3 py-2">
                      ETH
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-center py-2">
                  <ArrowUpDown className="w-5 h-5 text-gray-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">You will receive</label>
                  <div className="flex space-x-2">
                    <Input
                      value={wrapAmount}
                      readOnly
                      placeholder="0.0"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Badge variant="secondary" className="bg-purple-900 text-purple-300 px-3 py-2">
                      WETH
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={handleWrap}
                  disabled={!wrapAmount}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Wrap ETH
                </Button>
              </CardContent>
            </Card>

            {/* Unwrap WETH to ETH */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Repeat className="w-5 h-5 text-orange-400" />
                  <span>Unwrap WETH</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Amount to Unwrap</label>
                  <div className="flex space-x-2">
                    <Input
                      value={unwrapAmount}
                      onChange={(e) => setUnwrapAmount(e.target.value)}
                      placeholder="0.0"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Badge variant="secondary" className="bg-purple-900 text-purple-300 px-3 py-2">
                      WETH
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-center py-2">
                  <ArrowUpDown className="w-5 h-5 text-gray-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">You will receive</label>
                  <div className="flex space-x-2">
                    <Input
                      value={unwrapAmount}
                      readOnly
                      placeholder="0.0"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 px-3 py-2">
                      ETH
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={handleUnwrap}
                  disabled={!unwrapAmount}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Unwrap WETH
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="peg">
          <div className="grid gap-6">
            {/* Peg Tokens */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Unlink className="w-5 h-5 text-blue-400" />
                  <span>Peg Tokens</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Amount to Peg</label>
                  <div className="flex space-x-2">
                    <Input
                      value={pegAmount}
                      onChange={(e) => setPegAmount(e.target.value)}
                      placeholder="0.0"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 px-3 py-2">
                      TOKEN
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Pegging Rate</p>
                  <p className="text-lg font-semibold">1 TOKEN = 1 pTOKEN</p>
                </div>

                <Button
                  onClick={handlePeg}
                  disabled={!pegAmount}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Peg Tokens
                </Button>
              </CardContent>
            </Card>

            {/* Unpeg Tokens */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Repeat className="w-5 h-5 text-green-400" />
                  <span>Unpeg Tokens</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Amount to Unpeg</label>
                  <div className="flex space-x-2">
                    <Input
                      value={unpegAmount}
                      onChange={(e) => setUnpegAmount(e.target.value)}
                      placeholder="0.0"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Badge variant="secondary" className="bg-blue-900 text-blue-300 px-3 py-2">
                      pTOKEN
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Unpegging Rate</p>
                  <p className="text-lg font-semibold">1 pTOKEN = 1 TOKEN</p>
                </div>

                <Button
                  onClick={handleUnpeg}
                  disabled={!unpegAmount}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Unpeg Tokens
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
