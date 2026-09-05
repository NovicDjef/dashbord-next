import type { Metadata } from "next";
import { CommanderProviders } from "@/components/commander/providers";
import { CommanderShell } from "@/components/commander/shell";

export const metadata: Metadata = {
  title: "Commander",
  description: "Commandez vos restaurants préférés, envoyez un colis et suivez votre livreur en direct, directement depuis le site Koursier.",
};

export default function CommanderLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommanderProviders>
      <CommanderShell>{children}</CommanderShell>
    </CommanderProviders>
  );
}
