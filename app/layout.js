import Sidebar from "./component/Sidebar";
import "./globals.css";



export const metadata = {
  title: "Client Portal | Devkarnel CRM",
  description: "Manage your projects, track progress, and collaborate with the Devkarnel team in real-time.",
};
export default function RootLayout({ children }) {
  return (
    <html
      // suppressContentEditableWarning={true}
      suppressHydrationWarning={true}
      lang="en"
      className="h-full antialiased"
    >
      <body suppressHydrationWarning={true} className="min-h-full flex flex-col">
        <Sidebar />
        {children}
      </body>
    </html>
  );
}
