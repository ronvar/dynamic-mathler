"use client";

import { Providers } from "./providers";
import "./globals.css";
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
