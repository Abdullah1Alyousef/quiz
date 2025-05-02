import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import Header from "@/components/header"
import { EnvChecker } from "@/components/env-checker"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "QuizMaster - Test Your Knowledge",
  description: "Take quizzes and compete on leaderboards",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Header />
            <div className="container mx-auto px-4">
              <EnvChecker />
            </div>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
