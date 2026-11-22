import TrackOrderGate from "@/components/customer/TrackOrderGate";

export default async function TrackOrderResultPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <TrackOrderGate orderNumber={orderNumber} />;
}
