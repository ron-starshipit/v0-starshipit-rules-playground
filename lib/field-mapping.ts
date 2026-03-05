/**
 * Converts PascalCase to snake_case
 * Example: ShippingMethod -> shipping_method
 */
export function pascalToSnake(str: string): string {
  return str.replace(/([A-Z])/g, (match, letter, offset) =>
    offset > 0 ? `_${letter.toLowerCase()}` : letter.toLowerCase(),
  )
}

/**
 * Maps rule field names (PascalCase) to order field names (snake_case)
 * Handles special cases and nested fields
 */
export function getRuleFieldMapping(whereKey: string): string[] {
  const mappings: Record<string, string[]> = {
    // Direct mappings
    ItemSKU: ["items.*.sku"],
    Weight: ["weight"],
    Value: ["value"],
    Tags: ["tags"],
    ShippingMethod: ["shipping_method", "carrier_service_code"],
    ShippingDescription: ["shipping_description"],

    // Destination fields
    DestinationCountryCode: ["destination.country_code", "destination_country_code"],
    DestinationState: ["destination.state", "state"],
    DestinationPostCodeNZ: ["destination.post_code", "post_code", "postcode"],
    DestinationPostCode: ["destination.post_code", "post_code", "postcode"],
    DestinationSuburbOrCity: ["destination.suburb", "destination.city", "suburb", "city"],
    DestinationContactName: ["destination.name", "destination_name"],

    // Item fields
    ItemCountry: ["items.*.country", "items.*.country_of_manufacture"],
    ItemCountryOfManufacture: ["items.*.country_of_manufacture", "items.*.country"],

    // Carrier fields
    Carrier: ["carrier", "carrier_name"],
    CarrierServiceCode: ["carrier_service_code", "shipping_method"],

    // Special cases
    All: ["*"],
  }

  // If we have a specific mapping, use it
  if (mappings[whereKey]) {
    return mappings[whereKey]
  }

  // Otherwise, try converting PascalCase to snake_case
  return [pascalToSnake(whereKey)]
}

/**
 * Gets the value from an order object using a field path
 * Supports nested fields (e.g., "destination.state") and array wildcards (e.g., "items.*.sku")
 */
export function getOrderFieldValue(order: any, fieldPath: string): string | null {
  if (!order) return null

  // Handle wildcard for "All" condition
  if (fieldPath === "*") return "true"

  // Handle array wildcards (e.g., "items.*.sku")
  if (fieldPath.includes(".*")) {
    const [arrayPath, ...restPath] = fieldPath.split(".*")
    const arrayValue = getNestedValue(order, arrayPath)

    if (Array.isArray(arrayValue)) {
      const values = arrayValue
        .map((item) => {
          if (restPath.length > 0) {
            return getNestedValue(item, restPath.join(".").substring(1)) // Remove leading dot
          }
          return item
        })
        .filter((v) => v != null)

      return values.length > 0 ? values.join(",") : null
    }
    return null
  }

  // Handle nested fields (e.g., "destination.state")
  return getNestedValue(order, fieldPath)
}

/**
 * Gets a nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): string | null {
  const keys = path.split(".")
  let current = obj

  for (const key of keys) {
    if (current == null) return null
    current = current[key]
  }

  return current != null ? String(current) : null
}
