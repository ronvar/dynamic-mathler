"use client";

import { Providers } from "./providers";
import { AppShell, Center, Header, Navbar } from "@mantine/core";
import "./globals.css";
import AppNavBar from "@/components/navbar/navbar";
import AppHeaderBar from "@/components/headerBar/headerBar";
import { MathlersAppShell } from "@/app/appShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <MathlersAppShell>{children}</MathlersAppShell>
        </Providers>
      </body>
    </html>
  );
}
