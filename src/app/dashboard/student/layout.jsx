"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    FaHome,
    FaClipboardList,
    FaChartBar,
    FaUser,
    FaSignOutAlt,
    FaBars,
    FaBell,
    FaGlobe,
    FaCheckCircle,
} from "react-icons/fa";
import Logo from "@/components/Logo";

const menuItems = [
    {
        title: "Home",
        icon: FaHome,
        href: "/dashboard/student",
    },
    {
        title: "My Exam",
        icon: FaClipboardList,
        href: "/dashboard/student/exam",
    },
    {
        title: "View Results",
        icon: FaChartBar,
        href: "/dashboard/student/results",
    },
];

function StudentLayoutContent({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [studentInfo, setStudentInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Look for regular user session
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (!token || !user) {
            router.push("/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(user);
            if (parsedUser.role !== "user") {
                router.push("/login");
                return;
            }
            setStudentInfo(parsedUser);
        } catch (error) {
            console.error("Failed to parse user session", error);
            router.push("/login");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("examSession");
        router.push("/login");
    };

    const isActive = (href) => {
        return pathname === href;
    };

    if (isLoading || !studentInfo) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const NavItem = ({ item }) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
            <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 group ${active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                    }`}
            >
                <Icon className={`text-xl ${active ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
                {sidebarOpen && <span className="text-sm">{item.title}</span>}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Toggle Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${sidebarOpen ? "w-64" : "w-20"
                    } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-slate-100 mb-6">
                    {sidebarOpen ? (
                        <Logo className="w-36" />
                    ) : (
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
                            i
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="px-4 overflow-y-auto h-[calc(100vh-180px)]">
                    <nav>
                        {menuItems.map((item) => <NavItem key={item.href} item={item} />)}
                    </nav>
                </div>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all ${!sidebarOpen && 'justify-center'}`}
                    >
                        <FaSignOutAlt className="text-xl" />
                        {sidebarOpen && <span className="text-sm font-medium">Log Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
                {/* Top Navbar */}
                <header className="h-20 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl">
                            <FaBars />
                        </button>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl">
                            <FaBars />
                        </button>
                        {sidebarOpen && <h1 className="text-slate-800 font-bold hidden md:block">Student Dashboard</h1>}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 mr-4">
                            <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-all relative">
                                <FaBell />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                            </button>
                            <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-all">
                                <FaGlobe />
                            </button>
                        </div>

                        <div className="h-10 w-px bg-slate-100 mx-2"></div>

                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-800 leading-none mb-1">{studentInfo?.name || "Student"}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{studentInfo?.examId || "EXAM-ID"}</p>
                            </div>
                            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-100 overflow-hidden shadow-inner">
                                {studentInfo?.photo ? (
                                    <img src={studentInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    studentInfo?.name?.charAt(0).toUpperCase() || "S"
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function StudentLayout({ children }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        }>
            <StudentLayoutContent>{children}</StudentLayoutContent>
        </Suspense>
    );
}
