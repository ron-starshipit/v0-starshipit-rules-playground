import RulesPageClient from "./client"

export default function OrderPage({ params }: { params: { orderId: string } }) {
  return <RulesPageClient initialOrderId={params.orderId} />
}
