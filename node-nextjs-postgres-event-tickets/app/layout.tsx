import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Make a Book by Hand",
  description: "Tickets for one afternoon of bookmaking",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
