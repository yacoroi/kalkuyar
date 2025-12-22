'use client';

import { DISTRICTS, getNeighborhoods } from "@/lib/locations";
import { supabase } from "@/lib/supabase";
import { Award, MapPin, Phone, Search, User } from "lucide-react";
import { useEffect, useState } from "react";

interface AdminProfile {
    id: string;
    full_name: string | null;
    phone: string | null;
    city: string | null;
    district: string | null;
    neighborhood: string | null;
    topics: string[] | null;
    role: 'member' | 'admin' | 'district_head';
    points: number;
    avatar_url: string | null;
}

export default function UsersPage() {
    const [users, setUsers] = useState<AdminProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    // Reset Neighborhood when District changes
    useEffect(() => {
        setSelectedNeighborhood('');
    }, [selectedDistrict]);

    async function fetchUsers() {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("points", { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const filteredUsers = users.filter(user => {
        const matchDistrict = selectedDistrict ? user.district === selectedDistrict : true;
        const matchNeighborhood = selectedNeighborhood ? user.neighborhood === selectedNeighborhood : true;
        const matchSearch = searchQuery.toLowerCase() === '' ||
            (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.phone?.includes(searchQuery));

        return matchDistrict && matchNeighborhood && matchSearch;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kullanıcılar</h1>
                    <p className="text-gray-500 text-sm mt-1">Tüm kullanıcıları ve ilçe başkanlarını yönetin.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="İsim veya telefon ile ara..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* District Select */}
                <div className="w-full md:w-48">
                    <select
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-600 cursor-pointer"
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                    >
                        <option value="">Tüm İlçeler</option>
                        {DISTRICTS['İstanbul'].map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {/* Neighborhood Select */}
                <div className="w-full md:w-56">
                    <select
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-600 cursor-pointer disabled:opacity-50"
                        value={selectedNeighborhood}
                        onChange={(e) => setSelectedNeighborhood(e.target.value)}
                        disabled={!selectedDistrict}
                    >
                        <option value="">Tüm Mahalleler</option>
                        {selectedDistrict && getNeighborhoods(selectedDistrict).map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 group hover:border-gray-200 transition-all flex flex-col gap-4">

                        {/* Top: Profile */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 overflow-hidden border-2 border-white shadow-sm">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.full_name || 'Kullanıcı'} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{user.full_name || 'İsimsiz Kullanıcı'}</h3>
                                    <p className="text-gray-500 text-sm">{user.role === 'district_head' ? 'İlçe Başkanı' : 'Kullanıcı'}</p>
                                </div>
                            </div>

                        </div>

                        {/* Details */}
                        <div className="space-y-2 pt-2">
                            {/* Phone */}
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <div className="w-6 flex justify-center"><Phone size={14} /></div>
                                <span className={user.phone ? "font-medium" : "text-gray-400"}>
                                    {user.phone || 'Telefon Yok'}
                                </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <div className="w-6 flex justify-center"><MapPin size={14} /></div>
                                <span className="truncate">
                                    {user.district || '-'}, {user.neighborhood || '-'}
                                </span>
                            </div>

                            {/* Points */}
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <div className="w-6 flex justify-center"><Award size={14} /></div>
                                <span className="font-bold text-yellow-600">{user.points || 0} Puan</span>
                            </div>
                        </div>

                        {/* Topics */}
                        <div className="pt-4 border-t border-gray-50 flex flex-wrap gap-2">
                            {user.topics && user.topics.length > 0 ? (
                                user.topics.map((t: string) => (
                                    <span key={t} className="bg-gray-50 text-gray-500 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-100">
                                        {t}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-xs italic">İlgi alanı belirtilmemiş</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!loading && filteredUsers.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500">Aradığınız kriterlere uygun kullanıcı bulunamadı.</p>
                </div>
            )}
        </div>
    );
}
