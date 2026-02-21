import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-gray-400 py-12 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">MovieBooky</h3>
                        <p>&copy; {new Date().getFullYear()} MovieBooky. All rights reserved.</p>
                        <p className="text-sm">Your go-to destination for movies, events, and entertainment.</p>
                    </div>
                    <div>
                        <h4 className="text-white text-md font-semibold mb-4">Help</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white text-md font-semibold mb-4">Explore</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/movies" className="hover:text-white transition-colors">Movies</a></li>
                            <li><a href="/events" className="hover:text-white transition-colors">Events</a></li>
                            <li><a href="/sports" className="hover:text-white transition-colors">Sports</a></li>
                            <li><a href="/activities" className="hover:text-white transition-colors">Activities</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white text-md font-semibold mb-4">Social</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
                    <p>&copy; {new Date().getFullYear()} MovieShark. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
