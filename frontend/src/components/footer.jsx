'use client';

import Image from "next/image";

const Footer = () => {
    return (
        <div className="pt-20 px-4 bg-white dark:bg-black transition">

            <footer className="
                w-full max-w-[1350px] mx-auto 
                pt-10 lg:pt-14 
                px-4 sm:px-8 md:px-16 lg:px-28 
                rounded-tl-3xl rounded-tr-3xl overflow-hidden
                bg-gray-100 text-black
                dark:bg-[#131314] dark:text-white
            ">

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-10 md:gap-12">
                    
                    {/* LEFT */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Logo */}
                        <a href="/" className="block">
                            <Image src="/logo.png" alt="logo" width={40} height={40} className="block dark:hidden"/>
                            <Image src="/logo2.png" alt="logo" width={40} height={40} className="hidden dark:block"/>
                        </a>

                        <p className="text-sm leading-6 text-gray-600 dark:text-neutral-300 max-w-96">
                            Interview Matrix helps you enhancing your knowledge with AI powered mock interview.
                        </p>

                        {/* SOCIAL ICONS */}
                        <div className="flex gap-5 md:gap-6">

                            {/* X (Twitter) */}
                            <a href="#" className="transition hover:scale-110 text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-300">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153Zm-1.29 19.491h2.039L6.486 3.24H4.298l13.313 17.404Z"/>
                                </svg>
                            </a>

                            {/* GitHub */}
                            <a href="#" className="transition hover:scale-110 text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.19.69-3.87-1.37-3.87-1.37-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.52-2.55-.29-5.24-1.27-5.24-5.65 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.93 10.93 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.08 0 4.39-2.69 5.36-5.25 5.64.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.65.79.54A10.5 10.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z"/>
                                </svg>
                            </a>

                            {/* LinkedIn */}
                            <a href="#" className="transition hover:scale-110 text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.49 6S0 4.88 0 3.5 1.11 1 2.49 1s2.49 1.12 2.49 2.5zM.5 8h4V24h-4V8zm7.5 0h3.6v2.2h.05c.5-.95 1.72-2.2 3.55-2.2 3.8 0 4.5 2.5 4.5 5.75V24h-4v-8.75c0-2.1-.04-4.8-2.92-4.8-2.93 0-3.38 2.3-3.38 4.65V24h-4V8z"/>
                                </svg>
                            </a>

                            {/* YouTube */}
                            <a href="#" className="transition hover:scale-110 text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.5 6.2s-.2-1.7-.8-2.5c-.8-1-1.6-1-2-1.1C17.8 2.3 12 2.3 12 2.3h0s-5.8 0-8.7.3c-.4.1-1.2.1-2 1.1-.6.8-.8 2.5-.8 2.5S0 8.2 0 10.3v1.5c0 2.1.5 4.1.5 4.1s.2 1.7.8 2.5c.8 1 1.8 1 2.3 1.1 1.7.2 7.4.3 7.4.3s5.8 0 8.7-.3c.4-.1 1.2-.1 2-1.1.6-.8.8-2.5.8-2.5s.5-2 .5-4.1v-1.5c0-2.1-.5-4.1-.5-4.1zM9.5 14.7V7.8l6.3 3.5-6.3 3.4z"/>
                                </svg>
                            </a>

                            {/* Instagram */}
                            <a href="#" className="transition hover:scale-110 text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7.75 2C4.13 2 2 4.13 2 7.75v8.5C2 19.87 4.13 22 7.75 22h8.5c3.62 0 5.75-2.13 5.75-5.75v-8.5C22 4.13 19.87 2 16.25 2h-8.5zM12 7.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm5.25-1.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z"/>
                                </svg>
                            </a>

                        </div>
                    </div>

                    {/* RIGHT LINKS */}
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-28 items-start">
                        <div>
                            <h3 className="font-medium text-sm mb-4">Resources</h3>
                            <ul className="space-y-3 text-sm text-gray-600 dark:text-neutral-300">
                                <li><a href="/" className="hover:text-black dark:hover:text-white">Interview Matrix</a></li>
                                <li><a href="/dashboard" className="hover:text-black dark:hover:text-white">dashboard</a></li>
                                <li><a href="/upload" className="hover:text-black dark:hover:text-white">Interview</a></li>
                                <li><a href="/profile" className="hover:text-black dark:hover:text-white">profile</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="max-w-7xl mx-auto mt-12 pt-4 border-t border-gray-300 dark:border-neutral-700 flex justify-between items-center">
                    <p className="text-gray-600 dark:text-neutral-400 text-sm">© 2026 vaibhav srivastava Design</p>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">All right reserved.</p>
                </div>

            </footer>
        </div>
    );
};

export default Footer;