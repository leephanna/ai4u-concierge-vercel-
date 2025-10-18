export const metadata = {
  title: 'AI4U Concierge',
  description: 'MN/WI Private Concierge — Wayzata/Minnetonka & Madison/Lake Country'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{margin:0, background:'#ffffff'}}>
        {children}
      </body>
    </html>
  );
}
