import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Vendor Product Management – TRADEZ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f0f2f5" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
