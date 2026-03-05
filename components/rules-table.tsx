"use client"

import { useState } from "react"
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Settings,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Rule } from "@/lib/rules-data"
import { cn } from "@/lib/utils"

interface RulesTableProps {
  rules: Rule[]
  matchedRules: Set<number>
  accounts: { id: number; name: string }[]
  selectedAccount: number
  onAccountChange: (accountId: number) => void
  apiKey: string
  subscriptionKey: string
  onApiKeyChange: (key: string) => void
  onSubscriptionKeyChange: (key: string) => void
  isLoadingRules: boolean
  onRefreshRules: () => void
}

export function RulesTable({
  rules,
  matchedRules,
  accounts,
  selectedAccount,
  onAccountChange,
  apiKey,
  subscriptionKey,
  onApiKeyChange,
  onSubscriptionKeyChange,
  isLoadingRules,
  onRefreshRules,
}: RulesTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const groupedRules = rules.reduce(
    (acc, rule, index) => {
      const key = rule.set_key
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push({ ...rule, originalIndex: index })
      return acc
    },
    {} as Record<string, Array<Rule & { originalIndex: number }>>,
  )

  const allGroupKeys = Object.keys(groupedRules)
  const areAllExpanded = allGroupKeys.every((key) => expandedGroups[key] !== false)

  const handleExpandAll = () => {
    const newState: Record<string, boolean> = {}
    allGroupKeys.forEach((key) => {
      newState[key] = true
    })
    setExpandedGroups(newState)
  }

  const handleCollapseAll = () => {
    const newState: Record<string, boolean> = {}
    allGroupKeys.forEach((key) => {
      newState[key] = false
    })
    setExpandedGroups(newState)
  }

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }))
  }

  const hasApiKey = apiKey.length > 0

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExpandAll} className="h-7 text-xs">
            <ChevronsDownUp className="h-3.5 w-3.5 mr-1.5" />
            Expand All
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCollapseAll} className="h-7 text-xs">
            <ChevronsUpDown className="h-3.5 w-3.5 mr-1.5" />
            Collapse All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefreshRules}
            disabled={!hasApiKey || isLoadingRules}
            className="h-7 text-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoadingRules && "animate-spin")} />
            Resync Rules
          </Button>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
            <a href="https://app2.starshipit.com/settings/SettingsRules" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Configure Rules
            </a>
          </Button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs relative">
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Settings
              {!hasApiKey && <AlertCircle className="h-3 w-3 text-amber-500 absolute -top-0.5 -right-0.5" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">API Configuration</h4>
                <p className="text-xs text-gray-500">Configure your Starshipit API credentials</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="api-key" className="text-xs">
                    API Key
                  </Label>
                  <Input
                    id="api-key"
                    type="text"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder="Enter API key"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subscription-key" className="text-xs">
                    Subscription Key
                  </Label>
                  <Input
                    id="subscription-key"
                    type="text"
                    value={subscriptionKey}
                    onChange={(e) => onSubscriptionKeyChange(e.target.value)}
                    placeholder="Enter subscription key"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                {accounts.length > 1 && (
                  <div className="space-y-1.5">
                    <Label htmlFor="account" className="text-xs">
                      Account ID
                    </Label>
                    <Select
                      value={selectedAccount.toString()}
                      onValueChange={(value) => onAccountChange(Number(value))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isLoadingRules ? (
        <div className="text-center py-12 text-gray-500">Loading rules...</div>
      ) : rules.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
            <Settings className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Rules Loaded</h3>
          <p className="text-sm text-gray-500 mb-4">
            {hasApiKey ? "No rules configured for this account" : "Configure your API credentials to load rules"}
          </p>
          {!hasApiKey && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Open Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="center">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">API Configuration</h4>
                    <p className="text-xs text-gray-500">Configure your Starshipit API credentials</p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="api-key" className="text-xs">
                        API Key
                      </Label>
                      <Input
                        id="api-key"
                        type="text"
                        value={apiKey}
                        onChange={(e) => onApiKeyChange(e.target.value)}
                        placeholder="Enter API key"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="subscription-key" className="text-xs">
                        Subscription Key
                      </Label>
                      <Input
                        id="subscription-key"
                        type="text"
                        value={subscriptionKey}
                        onChange={(e) => onSubscriptionKeyChange(e.target.value)}
                        placeholder="Enter subscription key"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    {accounts.length > 1 && (
                      <div className="space-y-1.5">
                        <Label htmlFor="account" className="text-xs">
                          Account ID
                        </Label>
                        <Select
                          value={selectedAccount.toString()}
                          onValueChange={(value) => onAccountChange(Number(value))}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">WHERE</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">CONDITION</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">VALUE</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide pl-12">ACTION</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">RESULT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedRules).map(([actionKey, groupRules], groupIndex) => (
              <RuleGroup
                key={actionKey}
                actionKey={actionKey}
                rules={groupRules}
                matchedRules={matchedRules}
                isExpanded={expandedGroups[actionKey] !== false}
                onToggle={() => toggleGroup(actionKey)}
                isLastGroup={groupIndex === Object.entries(groupedRules).length - 1}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

function RuleGroup({
  actionKey,
  rules,
  matchedRules,
  isExpanded,
  onToggle,
  isLastGroup,
}: {
  actionKey: string
  rules: Array<Rule & { originalIndex: number }>
  matchedRules: Set<number>
  isExpanded: boolean
  onToggle: () => void
  isLastGroup: boolean
}) {
  const hasMatchedRule = rules.some((rule) => matchedRules.has(rule.originalIndex))
  const firstMatchedIndex = rules.findIndex((rule) => matchedRules.has(rule.originalIndex))

  return (
    <>
      <TableRow
        className={cn(
          "hover:bg-gray-100 cursor-pointer border-b border-gray-200",
          hasMatchedRule ? "bg-green-50" : "bg-gray-50",
        )}
        onClick={onToggle}
      >
        <TableCell colSpan={5} className="py-2">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            <span className={cn("text-sm font-semibold", hasMatchedRule ? "text-green-700" : "text-gray-900")}>
              {formatActionName(actionKey)}
            </span>
            <span className="text-xs text-gray-500 ml-auto">
              {rules.length} rule{rules.length !== 1 ? "s" : ""}
            </span>
          </div>
        </TableCell>
      </TableRow>

      {isExpanded &&
        rules.map((rule, groupIndex) => {
          const isMatched = matchedRules.has(rule.originalIndex)
          const isFirstMatch = groupIndex === firstMatchedIndex

          return <RuleRow key={rule.originalIndex} rule={rule} isMatched={isMatched} isFirstMatch={isFirstMatch} />
        })}

      {isExpanded && !isLastGroup && (
        <TableRow className="h-4">
          <TableCell colSpan={5} className="p-0 border-0"></TableCell>
        </TableRow>
      )}
    </>
  )
}

function RuleRow({
  rule,
  isMatched,
  isFirstMatch,
}: {
  rule: Rule & { originalIndex: number }
  isMatched: boolean
  isFirstMatch: boolean
}) {
  const showCheckmark = isMatched && isFirstMatch

  return (
    <>
      <TableRow className={cn("border-b border-gray-100", showCheckmark ? "bg-green-50/50" : "hover:bg-gray-50")}>
        <TableCell className="py-3">
          <div className="flex items-start gap-2">
            <div className="flex flex-col items-center gap-1 shrink-0">
              {showCheckmark && (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <Badge variant="default" className="h-4 px-1 text-[10px] bg-green-600 hover:bg-green-600">
                    Match
                  </Badge>
                </>
              )}
            </div>
            <span className={cn("text-sm", showCheckmark && "text-green-600 font-medium")}>
              {formatWhereKey(rule.where_key)}
            </span>
          </div>
        </TableCell>
        <TableCell className={cn("text-sm", showCheckmark && "text-green-600 font-medium")}>
          {rule.condition || "—"}
        </TableCell>
        <TableCell>
          <code
            className={cn(
              "text-xs font-mono bg-gray-100 px-2 py-1 rounded",
              showCheckmark && "text-green-600 bg-green-50",
            )}
          >
            {rule.value_to_find || "—"}
          </code>
        </TableCell>
        <TableCell className="text-sm pl-12">{formatActionName(rule.set_key)}</TableCell>
        <TableCell>
          <code className="text-xs font-mono text-gray-600">{formatActionValue(rule.set_key, rule.set_value)}</code>
        </TableCell>
      </TableRow>

      {rule.children &&
        rule.children.map((child, idx) => (
          <TableRow
            key={idx}
            className={cn("border-b border-gray-100", showCheckmark ? "bg-green-50/50" : "hover:bg-gray-50")}
          >
            <TableCell className="py-3 pl-8">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">↳</span>
                <span className={cn("text-sm", showCheckmark && "text-green-600 font-medium")}>
                  {formatWhereKey(child.where_key)}
                </span>
              </div>
            </TableCell>
            <TableCell className={cn("text-sm", showCheckmark && "text-green-600 font-medium")}>
              {child.condition}
            </TableCell>
            <TableCell>
              <code
                className={cn(
                  "text-xs font-mono bg-gray-100 px-2 py-1 rounded",
                  showCheckmark && "text-green-600 bg-green-50",
                )}
              >
                {child.value_to_find}
              </code>
            </TableCell>
            <TableCell className="text-sm text-gray-400 pl-12">—</TableCell>
            <TableCell className="text-sm text-gray-400">—</TableCell>
          </TableRow>
        ))}
    </>
  )
}

function formatWhereKey(key: string): string {
  const keyMap: Record<string, string> = {
    ItemSKU: "ItemSKU",
    ItemCountry: "ItemCountry",
    Weight: "Weight",
    Value: "Value",
    DestinationCountryCode: "DestinationCountryCode",
    DestinationState: "DestinationState",
    DestinationPostCodeNZ: "DestinationPostCodeNZ",
    DestinationSuburbOrCity: "DestinationSuburbOrCity",
    DestinationContactName: "DestinationContactName",
    Tags: "Tags",
    All: "All",
  }

  return keyMap[key] || key
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
      if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].Key) {
        return parsed.map((p: any) => p.Key).join(", ")
      }
      return parsed.join(", ")
    }
  } catch {
    // Not JSON, return as is
  }

  if (setKey === "AssignToAnotherAccount" || setKey === "SplitOrderToAnotherAccountBySKU") {
    return setValue
  }

  return setValue
}
