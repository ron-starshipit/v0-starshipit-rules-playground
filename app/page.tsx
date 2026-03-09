"use client"

import { useState, useEffect, useCallback } from "react"
import { RulesTester } from "@/components/rules-tester"
import { RulesTable } from "@/components/rules-table"

export default function RulesPage() {
  const [selectedAccount, setSelectedAccount] = useState<number | string>(0)
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [matchedRules, setMatchedRules] = useState<Set<number>>(new Set())
  const [apiKey, setApiKey] = useState("")
  const [subscriptionKey, setSubscriptionKey] = useState("")
  const [accounts, setAccounts] = useState<{ id: number | string; name: string }[]>([])
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
      // Fetch both parent rules and child account rules in parallel
      const [parentResponse, childResponse] = await Promise.all([
        fetch("/api/rules/parent", {
          headers: {
            "x-api-key": apiKey,
          },
        }),
        fetch("/api/rules", {
          headers: {
            "x-api-key": apiKey,
          },
        }),
      ])

      console.log("[v0] Parent rules fetch response status:", parentResponse.status)
      console.log("[v0] Child rules fetch response status:", childResponse.status)

      const allAccounts: { id: number | string; name: string }[] = []
      let combinedData: any = { Accounts: [], ParentRules: null }

      // Process parent rules
      if (parentResponse.ok) {
        const parentData = await parentResponse.json()
        console.log("[v0] Parent rules data received:", parentData)
        combinedData.ParentRules = parentData.data || []
        allAccounts.push({ id: "parent", name: "Parent account" })
      }

      // Process child account rules
      if (childResponse.ok) {
        const childData = await childResponse.json()
        console.log("[v0] Child rules data received:", childData)
        combinedData.Accounts = childData.Accounts || []

        const childAccounts = childData.Accounts.map((account: any) => ({
          id: account.AccountId,
          name: account.AccountId.toString(),
        })).sort((a: any, b: any) => a.id - b.id)

        allAccounts.push(...childAccounts)
      }

      console.log("[v0] All accounts:", allAccounts)

      setFetchedRulesData(combinedData)
      setAccounts(allAccounts)

      // Default to parent account if available, otherwise first child account
      if (allAccounts.length > 0) {
        const defaultAccount = allAccounts[0]
        setSelectedAccount(defaultAccount.id as any)
        if (defaultAccount.id === "parent") {
          setCurrentAccountRules(combinedData.ParentRules || [])
        } else {
          const accountData = combinedData.Accounts.find((acc: any) => acc.AccountId === defaultAccount.id)
          setCurrentAccountRules(accountData?.Rules.data || [])
        }
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

    if (selectedAccount === "parent") {
      console.log("[v0] Setting rules for parent account")
      setCurrentAccountRules(fetchedRulesData.ParentRules || [])
    } else {
      const accountData = fetchedRulesData.Accounts.find((acc: any) => acc.AccountId === selectedAccount)
      if (accountData) {
        console.log("[v0] Setting rules for account:", selectedAccount)
        setCurrentAccountRules(accountData.Rules.data || [])
      }
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
