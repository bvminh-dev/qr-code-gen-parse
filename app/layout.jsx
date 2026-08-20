export const metadata = { title: "QR gen + parse" };

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: "system-ui", maxWidth: 640, margin: "2rem auto", padding: "0 1rem" }}>
        {children}
      </body>
    </html>
  );
}
