import "./globals.css";

export const metadata = {
  title: "Content Farm Dashboard",
  description: "Live health of all channels",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
