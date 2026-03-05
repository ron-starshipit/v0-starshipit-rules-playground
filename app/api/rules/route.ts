import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key")

  if (!apiKey) {
    console.log("[v0] Rules API: Missing API key")
    return NextResponse.json({ error: "API key is required" }, { status: 401 })
  }

  console.log("[v0] Rules API: Fetching rules from Starshipit")

  try {
    const response = await fetch("https://store.starshipit.com/api/rules/storemanagement", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    console.log("[v0] Rules API: Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Rules API: Error response:", errorText)
      return NextResponse.json({ error: `Failed to fetch rules: ${response.statusText}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] Rules API: Successfully fetched rules for", data.Accounts?.length || 0, "accounts")

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Rules API: Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch rules from Starshipit API" }, { status: 500 })
  }
}
