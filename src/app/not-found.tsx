import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/greenprint/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="text-center">
        <Logo size={40} className="justify-center" />
        <div className="mt-8 font-display text-7xl font-extrabold text-brand/20">404</div>
        <h1 className="mt-2 font-display text-2xl font-bold">This page went off-grid</h1>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist — but your EcoScore is still safe.
        </p>
        <Button asChild className="mt-6 font-semibold">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back home
          </Link>
        </Button>
      </div>
    </div>
  );
}
