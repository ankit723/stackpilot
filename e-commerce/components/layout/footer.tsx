'use client'
import { FC } from 'react'
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Store, Gift } from 'lucide-react';

const Footer: FC = () => {
    return (
        <footer className="bg-background text-foreground border-t">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                    {/* About, Account, Policy, Help columns */}
                    <div className="col-span-1">
                        <h3 className="font-bold uppercase mb-4">About</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Investor Relationship</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Sitemap</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Blogs</Link></li>
                        </ul>
                    </div>
                    <div className="col-span-1">
                        <h3 className="font-bold uppercase mb-4">Account</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Track Order</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Terms of Use</Link></li>
                        </ul>
                    </div>
                    <div className="col-span-1">
                        <h3 className="font-bold uppercase mb-4">Policy</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Gift Card Policy</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Return Policy</Link></li>
                        </ul>
                    </div>
                    <div className="col-span-1">
                        <h3 className="font-bold uppercase mb-4">Help</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">FAQs</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Get in Touch</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Grievance Redressal</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter and Contact Info */}
                    <div className="col-span-2 md:pl-8">
                        <h3 className="font-bold uppercase mb-4">BE THE FIRST TO KNOW</h3>
                        <p className="text-sm text-muted-foreground mb-4">Sign up to stay updated on new products, brand stories and events.</p>
                        <div className="flex mb-8">
                            <Input type="email" placeholder="Email Address" className="rounded-r-none" />
                            <Button type="submit" className="rounded-l-none">Subscribe</Button>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                                <p className="text-muted-foreground">Page Industries Limited, Cessna Business Park, Umiya Business Bay-Tower-1, 7th Floor, Kadubeesanahalli, Varthur Hobli, Bengaluru, Karnataka, India, 560103</p>
                            </div>
                            <div className="flex items-center">
                                <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                                <a href="mailto:wecare@jockeyindia.com" className="text-muted-foreground hover:text-foreground">wecare@jockeyindia.com</a>
                            </div>
                            <div className="flex items-start">
                                <Phone className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">1800-572-1299 (Toll Free) / 1860-425-3333</p>
                                    <p className="text-muted-foreground text-xs">(Monday to Sunday, IST 10:00 AM to 7:00 PM)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between">
                    <div className="flex flex-wrap gap-4 mb-8 md:mb-0">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Store className="w-5 h-5" /> Store Locator
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5M8.5 17H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-4.5M8 12V7a4 4 0 0 1 4-4v0a4 4 0 0 1 4 4v5"/><path d="M2 12h20"/></svg>
                            Franchise
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Gift className="w-5 h-5" /> Corporate Gifting
                        </Button>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <div className="mb-4">
                            <h3 className="font-bold uppercase text-center md:text-right">Download the App From</h3>
                            <div className="flex gap-4 mt-2">
                                <Link href="#">
                                    <img src="https://www.jockey.in/react/images/google-play-badge.svg" alt="Google Play" className="h-10"/>
                                </Link>
                                <Link href="#">
                                    <img src="https://www.jockey.in/react/images/app-store-badge.svg" alt="App Store" className="h-10"/>
                                </Link>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <a href="#" className="text-muted-foreground hover:text-foreground"><Facebook /></a>
                            <a href="#" className="text-muted-foreground hover:text-foreground"><Twitter /></a>
                            <a href="#" className="text-muted-foreground hover:text-foreground"><Instagram /></a>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 border-t border-border pt-4 text-center text-muted-foreground">
                     <p>&copy; {new Date().getFullYear()} StackPilot. All rights reserved.</p>
                 </div>
            </div>
        </footer>
    )
}

export default Footer;
