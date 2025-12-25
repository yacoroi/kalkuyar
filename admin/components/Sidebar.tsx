'use client';

import { logout } from '@/actions/auth';
import { Award, BookOpen, ClipboardList, FileText, LayoutDashboard, LogOut, Mail, MessageSquare, Newspaper, Users, Video } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    return (
        <div className="w-72 bg-white h-screen border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] fixed left-0 top-0 z-50">
            {/* Brand */}
            <div className="p-8 pb-8 flex flex-col items-center">
                <img src="/kalkuyar-logo.png" alt="KalkUyar" className="h-10 object-contain mb-2" />
                <p className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Yönetim Paneli</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-2">Menü</p>

                <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all font-medium group">
                    <LayoutDashboard size={20} className="group-hover:text-red-600 transition-colors" />
                    <span>Genel Bakış</span>
                </Link>
                <Link href="/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all font-medium group">
                    <Users size={20} className="group-hover:text-red-600 transition-colors" />
                    <span>Kullanıcılar</span>
                </Link>
                <Link href="/tasks" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all font-medium group">
                    <ClipboardList size={20} className="group-hover:text-red-600 transition-colors" />
                    <span>Görev Yönetimi</span>
                </Link>
                <Link href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all font-medium group">
                    <FileText size={20} className="group-hover:text-red-600 transition-colors" />
                    <span>Raporlar</span>
                </Link>
                <Link href="/trainings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all font-medium group">
                    <BookOpen size={20} className="group-hover:text-red-600 transition-colors" />
                    <span>İçerik Kütüphanesi</span>
                </Link>
                <Link href="/surveys" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all font-medium group">
                    <MessageSquare size={20} className="group-hover:text-red-600 transition-colors" />
                    <span>Anket Yanıtları</span>
                </Link>
                <Link href="/leaderboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all font-medium group">
                    <Award size={20} className="group-hover:text-red-600 transition-colors" />
                    <span>Puan Sıralaması</span>
                </Link>
                <Link href="/news" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all font-medium group">
                    <Newspaper size={20} className="group-hover:text-red-600 transition-colors" />
                    <span>Haber Yönetimi</span>
                </Link>
                <Link href="/stories" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all font-medium group">
                    <Video size={20} className="group-hover:text-red-600 transition-colors" />
                    <span>Hikayeler</span>
                </Link>
                <Link
                    href="/contact"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/contact'
                        ? 'bg-red-50 text-red-600 shadow-sm shadow-red-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <Mail size={20} />
                    <span className="font-medium">Geri Bildirim Kutusu</span>
                </Link>
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-gray-50">
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all font-medium group text-left"
                >
                    <LogOut size={20} className="group-hover:text-red-600 transition-colors" />
                    <span>Çıkış Yap</span>
                </button>
            </div>
        </div>
    );
}
