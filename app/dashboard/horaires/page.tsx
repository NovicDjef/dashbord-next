"use client"

import { HorairesManagement } from "@/components/horaires-management";

export default function HorairesPage() {
  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
      <HorairesManagement showAllRestaurants={true} />
    </div>
  );
}