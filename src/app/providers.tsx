"use client";

import { MantineProvider } from "@mantine/core";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import React from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "64babdf4-fa6c-40dd-84f8-60c6a42535c4",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <MantineProvider
        theme={{
          colorScheme: "dark",
          fontFamily: inter.style.fontFamily,
        }}
      >
        <DynamicWidget />
        {children}
      </MantineProvider>
    </DynamicContextProvider>
  );
}
