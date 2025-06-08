"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    setIsDark(theme === "dark")
  }, [theme, mounted])

  const handleToggle = (checked: boolean) => {
    setIsDark(checked)
    setTheme(checked ? "dark" : "light")
  }

  if (!mounted) return null

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "relative w-[52px] h-[28px] rounded-full transition-colors duration-300",
          isDark ? "bg-primary" : "bg-primary/60"
        )}
      >
        <Switch
          checked={isDark}
          onCheckedChange={handleToggle}
          className="peer absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
        />
        <div className="absolute inset-0 rounded-full pointer-events-none transition-colors duration-300 peer-checked:bg-zinc-800 peer-checked:shadow-inner" />

        <div
          className={cn(
            "absolute top-[2px] left-[2px] h-[24px] w-[24px] bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300",
            isDark ? "translate-x-[24px] bg-zinc-900 text-primary" : "translate-x-0 text-primary"
          )}
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </div>
      </div>
    </div>
  )
}
