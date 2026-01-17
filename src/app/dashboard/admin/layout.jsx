"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    FaHome,
    FaUsers,
    FaQuestionCircle,
    FaChartBar,
    FaCog,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaUserGraduate,
    FaHeadphones,
    FaBook,
    FaPen,
    FaFolderOpen,
} from "react-icons/fa";

const menuItems = [
    {
        title: "Dashboard",
        icon: FaHome,
        href: "/dashboard/admin/dashboard",
    },
    {
        title: "Students",
        icon: FaUserGraduate,
        href: "/dashboard/admin/students",
        badge: "new",
    },
    {
        title: "Question Sets",
        icon: FaQuestionCircle,
        href: "/dashboard/admin/question-sets",
        submenu: [
            { title: "All Sets", icon: FaFolderOpen, href: "/dashboard/admin/question-sets", type: null },
            { title: "Listening Sets", icon: FaHeadphones, href: "/dashboard/admin/question-sets?type=LISTENING", type: "LISTENING" },
            { title: "Reading Sets", icon: FaBook, href: "/dashboard/admin/question-sets?type=READING", type: "READING" },
            { title: "Writing Sets", icon: FaPen, href: "/dashboard/admin/question-sets?type=WRITING", type: "WRITING" },
        ],
    },
    {
        title: "Exam Results",
        icon: FaChartBar,
        href: "/dashboard/admin/results",
    },
    {
        title: "Users",
        icon: FaUsers,
        href: "/dashboard/admin/users",
    },
    {
        title: "Settings",
        icon: FaCog,
        href: "/dashboard/admin/settings",
    },
];

function AdminLayoutContent({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [adminInfo, setAdminInfo] = useState(null);
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Get current type from URL params
    const currentType = searchParams?.get("type") || null;

    // Check if we're on the login page
    const isLoginPage = pathname === "/dashboard/admin";

    useEffect(() => {
        // Skip auth check on login page
        if (isLoginPage) {
            setIsLoading(false);
            return;
        }

        // Check authentication
        const auth = localStorage.getItem("adminAuth");
        if (!auth) {
            router.push("/dashboard/admin");
            return;
        }

        const parsed = JSON.parse(auth);
        if (parsed.role !== "admin") {
            router.push("/dashboard/admin");
            return;
        }

        setAdminInfo(parsed);
        setIsLoading(false);
    }, [router, isLoginPage]);

    // Auto-expand Question Sets submenu when on question-sets page
    useEffect(() => {
        if (pathname.includes("/question-sets")) {
            setExpandedMenu("Question Sets");
        }
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem("adminAuth");
        router.push("/dashboard/admin");
    };

    const isActive = (href) => {
        if (href.includes("?")) {
            return pathname === href.split("?")[0];
        }
        return pathname === href || pathname.startsWith(href + "/");
    };

    // Show login page without sidebar
    if (isLoginPage) {
        return <>{children}</>;
    }

    if (isLoading || !adminInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"
                    } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    {sidebarOpen ? (
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">IE</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-800">IELTS Admin</h1>
                                <p className="text-xs text-gray-500">Management System</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto">
                            <span className="text-white font-bold text-lg">IE</span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaBars className="text-gray-500" />
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <FaTimes className="text-gray-500" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
                    {menuItems.map((item) => (
                        <div key={item.href}>
                            {item.submenu ? (
                                <>
                                    <button
                                        onClick={() => setExpandedMenu(expandedMenu === item.title ? null : item.title)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive(item.href)
                                            ? "bg-cyan-50 text-cyan-600"
                                            : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        <item.icon className={`text-lg ${!sidebarOpen && "mx-auto"}`} />
                                        {sidebarOpen && (
                                            <>
                                                <span className="font-medium flex-1 text-left">{item.title}</span>
                                                <svg
                                                    className={`w-4 h-4 transition-transform ${expandedMenu === item.title ? "rotate-180" : ""
                                                        }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                    {sidebarOpen && expandedMenu === item.title && (
                                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                                            {item.submenu.map((sub) => {
                                                // Check if this submenu item is active
                                                const isOnQuestionSetsPage = pathname === "/dashboard/admin/question-sets";
                                                const isSubActive = isOnQuestionSetsPage && (
                                                    (sub.type === null && !currentType) ||
                                                    (sub.type === currentType)
                                                );

                                                return (
                                                    <Link
                                                        key={sub.href + (sub.type || 'all')}
                                                        href={sub.href}
                                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm group ${isSubActive
                                                            ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md"
                                                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                                            }`}
                                                    >
                                                        <sub.icon className={`text-base ${isSubActive ? "text-white" : "text-gray-400 group-hover:text-cyan-500"}`} />
                                                        <span className="font-medium">{sub.title}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive(item.href)
                                        ? "bg-cyan-50 text-cyan-600"
                                        : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    <item.icon className={`text-lg ${!sidebarOpen && "mx-auto"}`} />
                                    {sidebarOpen && (
                                        <span className="font-medium">{item.title}</span>
                                    )}
                                    {sidebarOpen && item.badge && (
                                        <span className="ml-auto bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* User Info & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    {sidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">
                                    {adminInfo.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{adminInfo.name}</p>
                                <p className="text-xs text-gray-500 truncate">{adminInfo.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <FaSignOutAlt />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-full p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                            title="Logout"
                        >
                            <FaSignOutAlt />
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"
                    }`}
            >
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <FaBars className="text-gray-600" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        {/* Current Date/Time */}
                        <div className="hidden sm:block text-sm text-gray-500">
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </div>

                        {/* Quick Actions */}
                        <Link
                            href="/dashboard/admin/students/create"
                            className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-teal-700 transition-all flex items-center gap-2"
                        >
                            <FaUserGraduate />
                            <span className="hidden sm:inline">Add Student</span>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8">{children}</div>
            </main>
        </div>
    );
}

// Wrap with Suspense for useSearchParams
export default function AdminLayout({ children }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
        }>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </Suspense>
    );
}
