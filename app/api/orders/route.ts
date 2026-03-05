import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key")
  const subscriptionKey = request.headers.get("x-subscription-key")
  const orderId = request.nextUrl.searchParams.get("order_id")
  const orderNumber = request.nextUrl.searchParams.get("order_number")

  if (!apiKey || !subscriptionKey) {
    console.log("[v0] Orders API: Missing credentials")
    return NextResponse.json({ error: "API key and subscription key are required" }, { status: 401 })
  }

  if (!orderId && !orderNumber) {
    console.log("[v0] Orders API: Missing order identifier")
    return NextResponse.json({ error: "Either order_id or order_number is required" }, { status: 400 })
  }

  const searchParam = orderId
    ? `order_id=${encodeURIComponent(orderId)}`
    : `order_number=${encodeURIComponent(orderNumber!)}`
  console.log("[v0] Orders API: Searching for order with", searchParam)

  try {
    const response = await fetch(`https://api.starshipit.com/api/orders?${searchParam}`, {
      headers: {
        "Content-Type": "application/json",
        "StarShipIT-Api-Key": apiKey,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
    })

    console.log("[v0] Orders API: Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Orders API: Error response:", errorText)
      return NextResponse.json({ error: `Failed to fetch order: ${response.statusText}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] Orders API: Successfully fetched order")

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Orders API: Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch order from Starshipit API" }, { status: 500 })
  }
}
