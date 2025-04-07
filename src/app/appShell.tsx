"use client";
import { useDataFetchingHooks } from "@/hooks/useDataFetchingHooks";
import { AppShell } from "@mantine/core";
import AppNavBar from "../components/navbar/navbar";
import AppHeaderBar from "../components/headerBar/headerBar";
import { useEffect, useState } from "react";

export function MathlersAppShell({ children }: { children: React.ReactNode }) {
  useDataFetchingHooks();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AppShell 
    padding="lg" 
    navbar={<AppNavBar />} 
    header={<AppHeaderBar />}
    styles={() => ({
      main: {
        minHeight: "90vh",
        maxHeight: "90vh"
      }
    })}>
      {children}
    </AppShell>
  );
}
