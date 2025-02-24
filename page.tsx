"use client"

import TicTacToe from "./app/views/tic-tac-toe"
import { ThemeProvider } from "@/components/theme-provider"

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TicTacToe />
    </ThemeProvider>
  )
}

