import "./globals.css"

export const metadata = {
  title: "Arunika API",
  description: "REST API dan playground generator media untuk bot WhatsApp."
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
