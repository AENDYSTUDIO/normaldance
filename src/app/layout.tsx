import Navbar from "@/components/layout/navbar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <title>NORMALDANCE - Web3 Music Platform</title>
        <meta name="description" content="Децентрализованная музыкальная платформа на Solana" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}