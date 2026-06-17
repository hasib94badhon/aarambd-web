"use client";

import { useParams } from "next/navigation";
import BusinessDetailPage from "@/components/business/BusinessDetailPage";

export default function ServiceDetailPage() {
  const { service_id } = useParams<{ service_id: string }>();
  return <BusinessDetailPage id={service_id} mode="service" />;
}
