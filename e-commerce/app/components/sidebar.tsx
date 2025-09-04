'use client'

import Link from "next/link"
import { FolderIcon, FilterIcon, LayersIcon, PackageIcon, ShoppingCartIcon, TagIcon, HomeIcon, ImageIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navLinks = [
    {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: <HomeIcon />,
        group: "Dashboard"
    },
    {
        label: "Category",
        href: "/admin/category",
        icon: <FolderIcon />,
        group: "Content Management"
    },
    {
        label: "Filters",
        href: "/admin/filters",
        icon: <FilterIcon />,
        group: "Content Management"
    },
    {
        label: "Filter Groups",
        href: "/admin/filter-group",
        icon: <LayersIcon />,
        group: "Content Management"
    },
    {
        label: "Products",
        href: "/admin/products",
        icon: <PackageIcon />,
        group: "Inventory"
    },
    {
        label: "Inventory",
        href: "/admin/inventory",
        icon: <PackageIcon />,
        group: "Inventory"
    },
    {
        label: "Orders",
        href: "/admin/orders",
        icon: <ShoppingCartIcon />,
        group: "Sales"
    },
    {
        label: "Tags",
        href: "/admin/tags",
        icon: <TagIcon />,
        group: "Content Management"
    },
    {
        label: "Images",
        href: "/admin/images",
        icon: <ImageIcon />,
        group: "Content Management"
    },
]

export const Sidebar = () => {
    // Group navigation links by their group property
    const groupedLinks = navLinks.reduce((acc, link) => {
        if (!acc[link.group]) {
            acc[link.group] = []
        }
        acc[link.group].push(link)
        return acc
    }, {} as Record<string, typeof navLinks>)

    const currentPath = usePathname()
    const isActive = (href: string) => currentPath === href || currentPath.startsWith(`${href}/`)
      

    return (
        <aside className="w-64 p-4 min-h-screen bg-secondary fixed top-17 left-0">
            <h1 className="text-xl font-bold mb-6">Admin Layout</h1>
            <nav>
                <div className="space-y-6">
                    {Object.entries(groupedLinks).map(([groupName, links]) => (
                        <div key={groupName}>
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                {groupName}
                            </h2>
                            <ul className="space-y-1">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link 
                                            href={link.href}
                                            className={cn("flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors", isActive(link.href) && "bg-primary hover:bg-primary")}
                                        >
                                            {link.icon}
                                            <span>{link.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </nav>
        </aside>
    )
}