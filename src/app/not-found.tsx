"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-9xl font-bold text-primary/20">404</h1>
      <h2 className="mt-4 text-3xl font-bold tracking-tight">
        Страница не найдена
      </h2>
      <p className="mt-2 text-lg text-muted-foreground">
        К сожалению, мы не смогли найти страницу, которую вы ищете.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Вернуться на главную</Link>
      </Button>
    </div>
  );
}
