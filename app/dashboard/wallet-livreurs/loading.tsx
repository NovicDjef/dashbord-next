import { IconRefresh } from "@tabler/icons-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <IconRefresh className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Chargement des wallets...</p>
      </div>
    </div>
  );
}
