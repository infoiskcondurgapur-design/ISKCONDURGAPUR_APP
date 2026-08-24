'use client';

import React from 'react';
import Link from 'next/link';
import { FaPrayingHands, FaCalendarAlt, FaUtensils, FaPlane } from 'react-icons/fa';

export default function SpiritualLifePage() {
    const sections = [
        {
            title: "Daily Worship",
            description: "Learn about the daily schedule of deity worship, offering bhoga, and arati.",
            link: "/spiritual-life/daily-worship",
            icon: <FaPrayingHands className="text-4xl text-iskcon-orange" />
        },
        {
            title: "Festivals",
            description: "Celebrating the divine pastimes of the Lord throughout the year.",
            link: "/spiritual-life/festivals",
            icon: <FaCalendarAlt className="text-4xl text-iskcon-orange" />
        },
        {
            title: "Prasadam",
            description: "The karma-free diet: offered vegetarian food that purifies the soul.",
            link: "/prasadam",
            icon: <FaUtensils className="text-4xl text-iskcon-orange" />
        },
        {
            title: "Spiritual Tours",
            description: "Pilgrimages to holy places like Vrindavan, Mayapur, and Jagannath Puri.",
            link: "/spiritual-tours",
            icon: <FaPlane className="text-4xl text-iskcon-orange" />
        }
    ];

    return (
        <main className="min-h-screen pt-20">
            <section className="relative py-4 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-100 to-orange-100"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">Spiritual Life</h1>
                    <p className="text-xl text-gray-600">Cultivating a life of devotion and higher consciousness</p>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {sections.map((section, index) => (
                            <Link key={index} href={section.link} className="block group">
                                <div className="bg-white p-8 rounded-xl shadow-md border hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full">
                                    <div className="mb-4">{section.icon}</div>
                                    <h2 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-iskcon-orange transition">{section.title}</h2>
                                    <p className="text-gray-600">{section.description}</p>
                                    <span className="inline-block mt-4 text-iskcon-orange font-medium">Learn More →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
