"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Search, Copy, Check, ExternalLink, Loader2 } from "lucide-react"
import type { Rule } from "@/lib/rules-data"
import { getRuleFieldMapping, getOrderFieldValue } from "@/lib/field-mapping"

interface RulesTesterProps {
  selectedOrder: string
  onOrderChange: (orderId: string) => void
  rules: Rule[]
  onMatchedRulesChange: (matchedRules: Set<number>) => void
  apiKey: string
  subscriptionKey: string
  initialOrderId?: string
}

export function RulesTester({
  selectedOrder,
  onOrderChange,
  rules,
  onMatchedRulesChange,
  apiKey,
  subscriptionKey,
  initialOrderId,
}: RulesTesterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [appliedActions, setAppliedActions] = useState<Array<{ action: string; value: string; ruleIndex: number }>>([])
  const [orderSearchQuery, setOrderSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [fetchedOrder, setFetchedOrder] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [isLoadingRules, setIsLoadingRules] = useState(false)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [isLoadingRecentOrders, setIsLoadingRecentOrders] = useState(false)
  const [recentOrdersOpen, setRecentOrdersOpen] = useState(false)

  const order = fetchedOrder

  useEffect(() => {
    if (recentOrdersOpen && apiKey && subscriptionKey && recentOrders.length === 0) {
      fetchRecentOrders()
    }
  }, [recentOrdersOpen, apiKey, subscriptionKey])

  const fetchRecentOrders = async () => {
    if (!apiKey || !subscriptionKey) return

    setIsLoadingRecentOrders(true)
    console.log("[v0] Fetching recent unshipped orders")

    try {
      const response = await fetch("/api/orders/unshipped", {
        headers: {
          "x-api-key": apiKey,
          "x-subscription-key": subscriptionKey,
        },
      })

      console.log("[v0] Recent orders response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Recent orders data:", data)

        if (data.orders) {
          setRecentOrders(data.orders.slice(0, 5))
        }
      } else {
        console.error("[v0] Failed to fetch recent orders:", await response.text())
      }
    } catch (error) {
      console.error("[v0] Failed to fetch recent orders:", error)
    } finally {
      setIsLoadingRecentOrders(false)
    }
  }

  const handleRecentOrderSelect = (orderId: string) => {
    const order = recentOrders.find((o) => o.order_id.toString() === orderId)
    if (order) {
      console.log("[v0] Selected recent order:", order.order_number || order.order_id)
      setOrderSearchQuery(order.order_number || order.order_id.toString())
      handleSearchOrder(order.order_number || order.order_id.toString())
    }
  }

  useEffect(() => {
    if (initialOrderId && apiKey && subscriptionKey) {
      setOrderSearchQuery(initialOrderId)
      handleSearchOrder(initialOrderId)
    }
  }, [initialOrderId, apiKey, subscriptionKey])

  const calculateOrderTotals = (order: any) => {
    if (!order?.items || order.items.length === 0) {
      return { totalWeight: 0, totalValue: 0 }
    }

    const totalWeight = order.items.reduce((sum: number, item: any) => {
      const itemWeight = Number.parseFloat(item.weight || 0) * (item.quantity || 1)
      return sum + itemWeight
    }, 0)

    const totalValue = order.items.reduce((sum: number, item: any) => {
      const itemValue = Number.parseFloat(item.price || item.value || 0) * (item.quantity || 1)
      return sum + itemValue
    }, 0)

    return { totalWeight, totalValue }
  }

  const handleSearchOrder = async (query?: string) => {
    const searchQuery = query || orderSearchQuery
    if (!searchQuery.trim() || !apiKey || !subscriptionKey) return

    setIsSearching(true)

    const cleanedQuery = searchQuery.trim()
    console.log("[v0] Searching for order:", cleanedQuery)

    try {
      let response = await fetch(`/api/orders?order_id=${encodeURIComponent(cleanedQuery)}`, {
        headers: {
          "x-api-key": apiKey,
          "x-subscription-key": subscriptionKey,
        },
      })

      console.log("[v0] Order search response status:", response.status)

      let data = null
      if (response.ok) {
        data = await response.json()
        console.log("[v0] Order data received:", data)
      }

      const isPaginatedResponse = data && data.page_number !== undefined
      const isErrorResponse = !response.ok || (data && data.success === false)

      if (isPaginatedResponse || isErrorResponse) {
        console.log("[v0] First attempt failed or returned paginated results, trying order_number search")

        response = await fetch(`/api/orders?order_number=${encodeURIComponent(cleanedQuery)}`, {
          headers: {
            "x-api-key": apiKey,
            "x-subscription-key": subscriptionKey,
          },
        })

        console.log("[v0] Order number search response status:", response.status)

        if (response.ok) {
          data = await response.json()
          console.log("[v0] Order number search data:", data)
        }
      }

      if (response.ok && data) {
        let normalizedOrder = null

        if (data.order) {
          normalizedOrder = data.order
        } else if (data.data?.orders && data.data.orders.length > 0) {
          const firstOrder = data.data.orders[0]
          normalizedOrder = {
            ...firstOrder,
            destination: firstOrder.destination || {
              name: firstOrder.contact_name,
              state: firstOrder.state,
              post_code: firstOrder.post_code,
              country: firstOrder.country,
            },
          }
        }

        if (normalizedOrder) {
          setFetchedOrder(normalizedOrder)
          onOrderChange(normalizedOrder.order_id.toString())
          setIsExpanded(true)
        } else if (data.success === false) {
          console.error("[v0] Order not found:", data.errors)
          alert("Order not found. Please check the order number and try again.")
        } else {
          console.error("[v0] Unexpected response format:", data)
          alert("Order not found. Please check the order number and try again.")
        }
      } else {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("[v0] Failed to fetch order:", error)
        alert("Failed to fetch order. Please check your API credentials and try again.")
      }
    } catch (error) {
      console.error("[v0] Failed to fetch order:", error)
      alert("Failed to fetch order. Please check your connection and try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleCopyOrderJson = async () => {
    if (!order) return

    try {
      await navigator.clipboard.writeText(JSON.stringify(order, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleOpenJsonEditor = () => {
    if (!order) return
    window.open("https://jsoneditoronline.org/", "_blank")
  }

  useEffect(() => {
    if (!selectedOrder || !order) {
      setAppliedActions([])
      onMatchedRulesChange(new Set())
      setIsLoadingRules(false)
      return
    }

    setIsLoadingRules(true)

    const { totalWeight, totalValue } = calculateOrderTotals(order)
    const orderWithTotals = {
      ...order,
      weight: totalWeight,
      value: totalValue,
    }

    const matched = new Set<number>()
    const actions: Array<{ action: string; value: string; ruleIndex: number }> = []
    const actionTypesSeen = new Set<string>()

    rules.forEach((rule, index) => {
      if (actionTypesSeen.has(rule.set_key)) return

      const isMatch = checkRuleMatch(rule, orderWithTotals)

      if (isMatch) {
        matched.add(index)
        actionTypesSeen.add(rule.set_key)
        actions.push({
          action: formatActionName(rule.set_key),
          value: formatActionValue(rule.set_key, rule.set_value),
          ruleIndex: index,
        })
      }
    })

    setAppliedActions(actions)
    onMatchedRulesChange(matched)
    setIsLoadingRules(false)
  }, [selectedOrder, order, rules, onMatchedRulesChange])

  const { totalWeight, totalValue } = order ? calculateOrderTotals(order) : { totalWeight: 0, totalValue: 0 }

  return (
    <div className="w-80 shrink-0 border border-gray-200 rounded-lg bg-white p-6 h-fit sticky top-6 px-4 py-4">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Rules Playground</h2>
          <p className="text-gray-500 text-xs">
            Visualise and test Starshipit rules. Search for an order to see which rule conditions would trigger.                              
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm text-gray-700">Search Order</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter order number"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchOrder()}
                  className="w-full pl-9"
                  disabled={!apiKey || !subscriptionKey}
                />
              </div>
              <Button
                size="sm"
                onClick={() => handleSearchOrder()}
                disabled={!orderSearchQuery.trim() || !apiKey || !subscriptionKey || isSearching}
              >
                {isSearching ? "..." : "Search"}
              </Button>
            </div>
          </div>

          <Select value={selectedOrder} onValueChange={handleRecentOrderSelect} onOpenChange={setRecentOrdersOpen}>
            <SelectTrigger className="w-full" disabled={!apiKey || !subscriptionKey}>
              <SelectValue placeholder={isLoadingRecentOrders ? "Loading..." : "Or select recent new order"} />
            </SelectTrigger>
            <SelectContent>
              {isLoadingRecentOrders ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <SelectItem key={order.order_id} value={order.order_id.toString()}>
                    {order.order_number || `Order ${order.order_id}`}
                    {(order.destination?.name || order.contact_name) &&
                      ` - ${order.destination?.name || order.contact_name}`}
                  </SelectItem>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-gray-500">No recent unshipped orders</div>
              )}
            </SelectContent>
          </Select>

          {!apiKey ||
            (!subscriptionKey && <p className="text-xs text-gray-400">Configure API keys in Settings to search</p>)}

          {selectedOrder && order && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 w-full"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {isExpanded ? "Hide" : "Show"} order details
              </button>

              {isExpanded && (
                <div className="space-y-2 text-xs text-gray-600 border border-gray-200 rounded p-3">
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <div>Order Number:</div>
                    <div className="font-mono">{order.order_number || order.name}</div>

                    {order.destination && (
                      <>
                        <div>Receiver:</div>
                        <div>{order.destination.name || order.destination}</div>
                      </>
                    )}

                    {(order.destination?.state ||
                      order.state ||
                      order.destination?.post_code ||
                      order.postCode ||
                      order.destination?.country) && (
                      <>
                        <div>Destination:</div>
                        <div className="font-mono">
                          {[
                            order.destination?.state || order.state,
                            order.destination?.post_code || order.postCode,
                            order.destination?.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      </>
                    )}

                    {order.shipping_method && (
                      <>
                        <div>Shipping Method:</div>
                        <div className="font-mono">{order.shipping_method}</div>
                      </>
                    )}

                    {order.shipping_description && (
                      <>
                        <div>Shipping:</div>
                        <div>{order.shipping_description}</div>
                      </>
                    )}

                    {totalValue > 0 && (
                      <>
                        <div>Order Value:</div>
                        <div className="font-mono">${totalValue.toFixed(2)}</div>
                      </>
                    )}

                    {totalWeight > 0 && (
                      <>
                        <div>Weight:</div>
                        <div className="font-mono">{totalWeight.toFixed(2)}kg</div>
                      </>
                    )}
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="mb-1">Items ({order.items.length}):</div>
                      <div className="space-y-1 pl-2">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="font-mono text-[11px]">
                            {item.sku && <span className="text-gray-900 font-semibold">{item.sku}</span>}
                            {item.sku && (item.description || item.name) && " - "}
                            {item.description || item.name} ({item.quantity}x)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.tags && order.tags.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="mb-1">Tags:</div>
                      <div className="flex flex-wrap gap-1 pl-2">
                        {order.tags.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700 font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyOrderJson}
                      className="flex-1 h-7 text-xs bg-transparent"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 mr-1.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1.5" />
                          Copy Full JSON
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenJsonEditor}
                      className="h-7 px-2 bg-transparent"
                      title="Open in JSON Editor Online"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {selectedOrder && order && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Triggered Rules:</h3>

            {isLoadingRules ? (
              <div className="text-sm text-gray-500 text-center py-4">Evaluating rules...</div>
            ) : appliedActions.length > 0 ? (
              <div className="space-y-2">
                {appliedActions.map((action, idx) => (
                  <div key={idx} className="text-sm border border-green-200 bg-green-50/30 rounded px-3 py-2">
                    <div className="font-medium text-gray-900">{action.action}</div>
                    <div className="text-xs text-gray-600 font-mono mt-0.5">{action.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">No rules matched</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function checkRuleMatch(rule: Rule, order: any): boolean {
  const mainMatch = checkCondition(rule.where_key, rule.condition, rule.value_to_find, order)

  if (!mainMatch) return false

  if (rule.children && rule.children.length > 0) {
    return rule.children.every((child) => checkCondition(child.where_key, child.condition, child.value_to_find, order))
  }

  return true
}

function checkCondition(whereKey: string, condition: string, valueToFind: string, order: any): boolean {
  const fieldPaths = getRuleFieldMapping(whereKey)

  let orderValue: string | null = null
  for (const fieldPath of fieldPaths) {
    orderValue = getOrderFieldValue(order, fieldPath)
    if (orderValue != null) {
      console.log(`[v0] Matched field ${whereKey} -> ${fieldPath} = ${orderValue}`)
      break
    }
  }

  if (orderValue == null) {
    console.log(`[v0] No value found for field ${whereKey} in order`)
    return false
  }

  switch (condition) {
    case "Is":
      return orderValue === valueToFind
    case "Contains":
      return orderValue?.toLowerCase().includes(valueToFind.toLowerCase())
    case "Greater Than":
      return Number.parseFloat(orderValue) > Number.parseFloat(valueToFind)
    case "Between":
      const [min, max] = valueToFind.split("-")
      const val = Number.parseFloat(orderValue)
      return val >= Number.parseFloat(min) && val <= Number.parseFloat(max)
    case "":
      return true
    default:
      return false
  }
}

function formatActionName(setKey: string): string {
  const nameMap: Record<string, string> = {
    ATL: "ATL",
    CheapestOption: "CheapestOption",
    Signature: "Signature",
    SetPackageType: "SetPackageType",
    ReturnCost: "ReturnCost",
    CarrierAndProductCode: "CarrierAndProductCode",
    AssignToAnotherAccount: "AssignToAnotherAccount",
    AssignTags: "AssignTags",
    CheapestOptionFromSpecificCarriers: "CheapestOptionFromSpecificCarriers",
    SplitOrderToAnotherAccountBySKU: "SplitOrderToAnotherAccountBySKU",
  }

  return nameMap[setKey] || setKey
}

function formatActionValue(setKey: string, setValue: string): string {
  if (setValue === "True") return "True"
  if (setValue === "False") return "False"

  try {
    const parsed = JSON.parse(setValue)
    if (parsed.CarrierId && parsed.ProductCode) {
      return parsed.ProductCode
    }
    if (Array.isArray(parsed)) {
      return parsed.map((p: any) => p.Key || p).join(", ")
    }
  } catch {
    // Not JSON
  }

  return setValue
}
