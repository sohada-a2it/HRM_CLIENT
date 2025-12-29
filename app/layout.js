import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/common/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "A2IT HRM System",
  description: "Employee Management & Payroll System",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen overflow-hidden">
          {/* Fixed Sidebar - Never scrolls */}
          <div className="h-screen flex-shrink-0">
            <Sidebar />
          </div>
          
          {/* Scrollable Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8 min-h-full bg-gray-50">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}