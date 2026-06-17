"use client";

import { useParams } from "next/navigation";
import BusinessDetailPage from "@/components/business/BusinessDetailPage";

export default function ShopDetailPage() {
  const { shop_id } = useParams<{ shop_id: string }>();
  return <BusinessDetailPage id={shop_id} mode="shop" />;
}
