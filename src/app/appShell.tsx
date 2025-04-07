"use client";
import { useDataFetchingHooks } from "@/hooks/useDataFetchingHooks";
import { AppShell } from "@mantine/core";
import AppNavBar from "../components/navbar/navbar";
import AppHeaderBar from "../components/headerBar/headerBar";

export function MathlersAppShell({ children }: { children: React.ReactNode }) {
  useDataFetchingHooks();

  return (
    <AppShell padding="lg" navbar={<AppNavBar />} header={<AppHeaderBar />}>
      {children}
    </AppShell>
  );
}
