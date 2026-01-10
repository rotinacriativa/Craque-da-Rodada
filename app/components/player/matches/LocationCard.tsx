interface LocationCardProps {
    location: string;
}

export function LocationCard({ location }: LocationCardProps) {
    return (
        <section className="rounded-2xl overflow-hidden border border-[#e7f3eb] dark:border-[#1f3b28] bg-white dark:bg-[#183020] shadow-sm">
            <div className="h-48 w-full bg-gray-200 relative group">
                {/* Map Placeholder */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-opacity hover:opacity-90"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAXN2pk8LXHs1dsBLfAhgFB3zKlTTOOymcoK9-htdI6HJe7H_tFy3FbZy719E3qzsI-He-8AQwruCn5QbrQJ7SxwfefiaS04MlhIsAVPnOVYNabWFI6V45Wcs36gRxsCgZaPXs6zZmGFDTXEr5Vf_0YlWd3YotfGAOZiy0Ol2bt_4qg5e9p702ISVP8a_Iy9cWU3QLsBvrgSj1PG5OYJ1hOPgv27H0Ul9GyDljiyNB9jfQf2TdoORZL8uPnfPumx8pclO8jzirPwIY")' }}
                />
                <button className="absolute bottom-4 right-4 bg-white dark:bg-[#102216] text-[#0d1b12] dark:text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[#13ec5b]">map</span>
                    Ver no Mapa
                </button>
            </div>

            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1 text-[#0d1b12] dark:text-white">
                            {location}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Campo Society 7 • Grama Sintética
                        </p>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-lg">
                                <span className="material-symbols-outlined text-[#13ec5b]">local_parking</span>
                                Estacionamento
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-lg">
                                <span className="material-symbols-outlined text-[#13ec5b]">shower</span>
                                Vestiário
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-lg">
                                <span className="material-symbols-outlined text-[#13ec5b]">sports_bar</span>
                                Bar
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
