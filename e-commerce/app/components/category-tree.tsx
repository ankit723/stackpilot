"use client"

import { useState, useMemo } from "react"
import { Category } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils" // Assuming you have a className utility
import { toast } from "sonner"

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
}

interface CategoryTreeProps {
  categories: CategoryWithChildren[]
  selectedCategoryId: string | null
  onSelectCategory: (id: string) => void
}

interface CategoryNodeProps {
  node: CategoryWithChildren
  selectedCategoryId: string | null
  onSelectCategory: (id: string) => void
  depth: number
}

const CategoryNode = ({
  node,
  selectedCategoryId,
  onSelectCategory,
  depth
}: CategoryNodeProps) => {
  const [isOpen, setIsOpen] = useState(true)

  const hasChildren = useMemo(
    () => node.children && node.children.length > 0,
    [node.children]
  )

  const handleSelectCategory = () => {
    if (hasChildren) {
        toast.error("Cannot select a category with children")
        return
    }
    onSelectCategory(node.id)
  }

  const isSelected = selectedCategoryId === node.id

  return (
    <div aria-expanded={hasChildren ? isOpen : undefined} role="treeitem" aria-selected={isSelected}>
      <div
        className={cn(
          "flex items-center space-x-1 transition-all duration-200",
          `pl-${Math.min(depth * 4, 20)}`
        )}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(prev => !prev)}
            className="mr-1"
            aria-label={isOpen ? "Collapse category" : "Expand category"}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}

        <Button
          variant={isSelected ? "secondary" : "ghost"}
          onClick={handleSelectCategory}
          className={cn(
            "flex-grow justify-start h-8 text-left rounded-lg transition-colors duration-200",
            isSelected
              ? "bg-secondary text-primary font-medium"
              : "hover:bg-muted text-muted-foreground"
          )}
          aria-selected={isSelected}
        >
          {node.name}
        </Button>
      </div>

      {hasChildren && isOpen && (
        <div role="group" className="ml-2 mt-1 border-l border-muted pl-2 space-y-1">
          {node.children!.map(child => (
            <CategoryNode
              key={child.id}
              node={child}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={onSelectCategory}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const CategoryTree = ({
  categories,
  selectedCategoryId,
  onSelectCategory
}: CategoryTreeProps) => {
  return (
    <div className="border p-4 rounded-xl max-h-80 overflow-auto space-y-1 bg-background shadow-md" role="tree">
      {categories.map(category => (
        <CategoryNode
          key={category.id}
          node={category}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={onSelectCategory}
          depth={0}
        />
      ))}
    </div>
  )
}
