"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

const AVAILABLE_TOPICS = [
    'Ekonomi', 'Gençlik', 'Aile', 'Adalet', 'Eğitim',
    'Tarım', 'Şehircilik', 'Dış Politika', 'Sağlık', 'Teknoloji', 'D-8'
];

export default function TopicReports() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_TOPICS.map((topic) => (
                <Link
                    key={topic}
                    href={`/reports/topic/${topic}`}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all group flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center font-bold text-xl group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                            {topic.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900 text-lg">{topic}</span>
                    </div>
                    <ArrowRight className="text-gray-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                </Link>
            ))}
        </div>
    );
}
