"use client"

import { UsersManagement } from "@/components/users-management";

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
      <UsersManagement />
    </div>
  );
}
