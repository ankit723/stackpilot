
import { getProducts } from "@/app/actions/admin/product/product";
import { ProductsTable } from "@/app/components/products-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, GitFork, Package, Plus, Warehouse } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage() {
    const products = await getProducts();

    const totalProducts = products.length;
    const totalVariants = products.reduce((sum, product) => sum + product.children.length, 0);
    const publishedProducts = products.filter(p => p.status === 'PUBLISHED').length;
    const totalStock = products.reduce((sum, product) => {
        if (product.type === 'CONFIGURABLE' && product.children.length > 0) {
            return sum + product.children.reduce((variantSum, variant) => variantSum + variant.stock, 0);
        }
        return sum + product.stock;
    }, 0);

    return (
        <div className="container mx-auto space-y-6 p-6 max-w-7xl">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage products and organize your catalog
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Product
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Variants</CardTitle>
                        <GitFork className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVariants}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{publishedProducts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStock}</div>
                    </CardContent>
                </Card>
            </div>

            <ProductsTable products={products} />
        </div>
    );
}