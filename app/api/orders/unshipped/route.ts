import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")
    const subscriptionKey = request.headers.get("x-subscription-key")

    if (!apiKey || !subscriptionKey) {
      console.log("[v0] Unshipped Orders API: Missing API credentials")
      return NextResponse.json({ error: "Missing API credentials" }, { status: 401 })
    }

    // Calculate date 15 days ago in RFC3339 format
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
    const sinceDate = fifteenDaysAgo.toISOString()

    const url = `https://api.starshipit.com/api/orders/unshipped?since_last_updated=${encodeURIComponent(sinceDate)}&limit=5`

    console.log("[v0] Unshipped Orders API: Fetching recent unshipped orders")
    console.log("[v0] Unshipped Orders API: URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "StarShipIT-Api-Key": apiKey,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
    })

    console.log("[v0] Unshipped Orders API: Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Unshipped Orders API: Error response:", errorText)
      return NextResponse.json(
        { error: "Failed to fetch unshipped orders", details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[v0] Unshipped Orders API: Successfully fetched", data.orders?.length || 0, "orders")

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Unshipped Orders API: Exception:", error)
    return NextResponse.json({ error: "Failed to fetch unshipped orders" }, { status: 500 })
  }
}
