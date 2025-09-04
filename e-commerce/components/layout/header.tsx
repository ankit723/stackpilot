'use client'
import { getCategories } from "@/app/actions/storefront/categories/actions";
import { Button } from "@/components/ui/button";
import { Category } from "@prisma/client";
import { Heart, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

type CategoryTree = Category & {
    children: (Category & {
        children: Category[]
    })[];
};

const Header = () => {
    const [categories, setCategories] = useState<CategoryTree[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const fetchedCategories = await getCategories();
            setCategories(fetchedCategories as CategoryTree[]);
        };
        fetchCategories();
    }, []);

    return (
        <header className="bg-background text-foreground relative border-b shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-xl font-bold flex items-center gap-20">
                    <Link href="/">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 text-transparent bg-clip-text animate-text-fade">
                            StackPilot
                        </h1>
                    </Link>
                    
                    <nav>
                        <ul className="flex space-x-4">
                            {categories.map((category) => (
                                <li key={category.id} className="group static">
                                    <Link href={`/category/${category.slug}`} className="text-muted-foreground px-3 py-7 rounded-md font-bold inline-block uppercase hover:text-foreground" style={{ fontSize: '1.05rem' }}>
                                        {category.name}
                                    </Link>
                                    {category.children && category.children.length > 0 && (
                                        <div className="absolute top-full left-50 right-0 bg-background shadow-lg hidden group-hover:block z-20 border-t max-w-7xl rounded-b-lg">
                                            <div className="container mx-auto px-6 py-8">
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 text-foreground">
                                                    {category.children.map((child) => (
                                                        <div key={child.id}>
                                                            <h3 className="text-sm font-bold tracking-wider uppercase">
                                                                <Link href={`/category/${child.slug}`} className="hover:underline">{child.name}</Link>
                                                            </h3>
                                                            <ul className="mt-4 space-y-3">
                                                                {child.children.map((grandchild) => (
                                                                    <li key={grandchild.id}>
                                                                        <Link href={`/category/${grandchild.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
                                                                            {grandchild.name}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <Input placeholder="Search" className="w-72 text-foreground shadow-none rounded-full p-6 pl-14 border-none text-lg bg-secondary" />
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                    <div className="relative">
                        <Heart className="w-7 h-7" />
                        <span className="sr-only">Wishlist</span>
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                            1
                        </div>
                    </div>
                    <div className="relative">
                        <ShoppingCart className="w-7 h-7" />
                        <span className="sr-only">Cart</span>
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                            1
                        </div>
                    </div>
                        <User className="w-7 h-7" />
                </div>
            </div>
        </header>
    );
};

export default Header;
