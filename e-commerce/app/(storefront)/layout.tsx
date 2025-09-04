import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Header />
            {children}
            <Footer />
        </div>
    )
}