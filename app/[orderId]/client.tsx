"use client"

import { useState, useEffect, useCallback } from "react"
import { RulesTester } from "@/components/rules-tester"
import { RulesTable } from "@/components/rules-table"

export default function RulesPageClient({ initialOrderId }: { initialOrderId: string }) {
  const [selectedAccount, setSelectedAccount] = useState<number>(0)
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [matchedRules, setMatchedRules] = useState<Set<number>>(new Set())
  const [apiKey, setApiKey] = useState("")
  const [subscriptionKey, setSubscriptionKey] = useState("")
  const [accounts, setAccounts] = useState<{ id: number; name: string }[]>([])
  const [currentAccountRules, setCurrentAccountRules] = useState<any[]>([])
  const [isLoadingRules, setIsLoadingRules] = useState(false)
  const [fetchedRulesData, setFetchedRulesData] = useState<any>(null)

  useEffect(() => {
    const savedApiKey = localStorage.getItem("starshipit_api_key")
    const savedSubscriptionKey = localStorage.getItem("starshipit_subscription_key")

    if (savedApiKey) setApiKey(savedApiKey)
    if (savedSubscriptionKey) setSubscriptionKey(savedSubscriptionKey)
  }, [])

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("starshipit_api_key", apiKey)
    }
  }, [apiKey])

  useEffect(() => {
    if (subscriptionKey) {
      localStorage.setItem("starshipit_subscription_key", subscriptionKey)
    }
  }, [subscriptionKey])

  useEffect(() => {
    if (!apiKey) return

    const timer = setTimeout(() => {
      fetchRules()
    }, 1000)

    return () => clearTimeout(timer)
  }, [apiKey])

  const fetchRules = useCallback(async () => {
    if (!apiKey) {
      console.log("[v0] No API key provided, skipping fetch")
      return
    }

    setIsLoadingRules(true)
    console.log("[v0] Fetching rules with API key")

    try {
      const response = await fetch("/api/rules", {
        headers: {
          "x-api-key": apiKey,
        },
      })

      console.log("[v0] Rules fetch response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Rules data received:", data)

        setFetchedRulesData(data)

        const fetchedAccounts = data.Accounts.map((account: any) => ({
          id: account.AccountId,
          name: `Account ${account.AccountId}`,
        }))

        console.log("[v0] Parsed accounts:", fetchedAccounts)

        setAccounts(fetchedAccounts)
        setSelectedAccount(fetchedAccounts[0]?.id || 0)
        setCurrentAccountRules(data.Accounts[0]?.Rules.data || [])
      } else {
        const error = await response.json()
        console.error("[v0] Failed to fetch rules:", error)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch rules:", error)
    } finally {
      setIsLoadingRules(false)
    }
  }, [apiKey])

  useEffect(() => {
    if (!selectedAccount || !fetchedRulesData) return

    console.log("[v0] Account changed to:", selectedAccount)

    const accountData = fetchedRulesData.Accounts.find((acc: any) => acc.AccountId === selectedAccount)

    if (accountData) {
      console.log("[v0] Setting rules for account:", selectedAccount)
      setCurrentAccountRules(accountData.Rules.data || [])
    }
  }, [selectedAccount, fetchedRulesData])

  return (
    <div className="min-h-screen bg-white">
      <div className="flex gap-6 p-6">
        <RulesTester
          selectedOrder={selectedOrder}
          onOrderChange={setSelectedOrder}
          rules={currentAccountRules}
          onMatchedRulesChange={setMatchedRules}
          apiKey={apiKey}
          subscriptionKey={subscriptionKey}
          initialOrderId={initialOrderId}
        />

        <RulesTable
          rules={currentAccountRules}
          matchedRules={matchedRules}
          accounts={accounts}
          selectedAccount={selectedAccount}
          onAccountChange={setSelectedAccount}
          apiKey={apiKey}
          subscriptionKey={subscriptionKey}
          onApiKeyChange={setApiKey}
          onSubscriptionKeyChange={setSubscriptionKey}
          isLoadingRules={isLoadingRules}
          onRefreshRules={fetchRules}
        />
      </div>
    </div>
  )
}
