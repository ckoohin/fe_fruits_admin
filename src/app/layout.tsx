import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fruits Admin - Trang quản trị",
  description: "Hệ thống quản trị cho nền tảng thương mại điện tử",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          reverseOrder={false}
          containerStyle={{
            top: '150px',  
            right: '24px',
          }}
          toastOptions={{
            style: {
              padding: '12px 16px',
              color: '#000',
              fontWeight: '500',
              borderRadius: '8px',
              fontSize: '16px',
            },
            success: {
              style: {
                background: '#d1fae5',
                color: '#000',
              },
            },
            error: {
              style: {
                background: '#fee2e2',
                color: '#000', 
              },
            },
            loading: {
              style: {
                background: '#bfdbfe',
                color: '#000', 
              },
            },
          }}
        />
      </body>
    </html>
  );
}