import { motion } from "motion/react";
import { useState } from "react";
import { Star, MapPin, TrendingUp, DollarSign, Heart, Search, Filter } from "lucide-react";

export default function UniversityShortlist() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [shortlisted, setShortlisted] = useState<number[]>([1, 3, 5]);

  const universities = [
    {
      id: 1,
      name: "Massachusetts Institute of Technology",
      shortName: "MIT",
      country: "United States",
      flag: "🇺🇸",
      ranking: "#1",
      tuition: "$53,790/year",
      acceptance: "3.9%",
      programs: ["Computer Science", "Engineering", "Business"],
      location: "Cambridge, MA",
      image: "https://images.unsplash.com/photo-1772546392507-5ab8236031a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2ElMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc2Njc2NzU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 2,
      name: "University of Oxford",
      shortName: "Oxford",
      country: "United Kingdom",
      flag: "🇬🇧",
      ranking: "#2",
      tuition: "£26,770/year",
      acceptance: "17.5%",
      programs: ["Law", "Medicine", "Philosophy"],
      location: "Oxford, UK",
      image: "https://images.unsplash.com/20/cambridge.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1ayUyMG94Zm9yZCUyMGNhbWJyaWRnZSUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzc2Njc2NzU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 3,
      name: "Stanford University",
      shortName: "Stanford",
      country: "United States",
      flag: "🇺🇸",
      ranking: "#3",
      tuition: "$56,169/year",
      acceptance: "4.3%",
      programs: ["Computer Science", "Business", "Engineering"],
      location: "Stanford, CA",
      image: "https://images.unsplash.com/photo-1772546392507-5ab8236031a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2ElMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc2Njc2NzU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 4,
      name: "University of Cambridge",
      shortName: "Cambridge",
      country: "United Kingdom",
      flag: "🇬🇧",
      ranking: "#4",
      tuition: "£24,507/year",
      acceptance: "21%",
      programs: ["Mathematics", "Engineering", "Natural Sciences"],
      location: "Cambridge, UK",
      image: "https://images.unsplash.com/20/cambridge.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1ayUyMG94Zm9yZCUyMGNhbWJyaWRnZSUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzc2Njc2NzU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 5,
      name: "University of Toronto",
      shortName: "UofT",
      country: "Canada",
      flag: "🇨🇦",
      ranking: "#18",
      tuition: "CAD $58,160/year",
      acceptance: "43%",
      programs: ["Computer Science", "Business", "Medicine"],
      location: "Toronto, ON",
      image: "https://images.unsplash.com/photo-1618255630366-f402c45736f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5hZGElMjB0b3JvbnRvJTIwdW5pdmVyc2l0eSUyMGNhbXB1c3xlbnwxfHx8fDE3NzY2NzY3NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 6,
      name: "University of Melbourne",
      shortName: "Melbourne",
      country: "Australia",
      flag: "🇦🇺",
      ranking: "#14",
      tuition: "AUD $45,824/year",
      acceptance: "70%",
      programs: ["Medicine", "Engineering", "Business"],
      location: "Melbourne, VIC",
      image: "https://images.unsplash.com/photo-1693872398294-93f419e6475a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXN0cmFsaWElMjBzeWRuZXklMjB1bml2ZXJzaXR5JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc2Njc2NzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 7,
      name: "Technical University of Munich",
      shortName: "TUM",
      country: "Germany",
      flag: "🇩🇪",
      ranking: "#49",
      tuition: "€0 (Public)",
      acceptance: "8%",
      programs: ["Engineering", "Computer Science", "Physics"],
      location: "Munich, Germany",
      image: "https://images.unsplash.com/photo-1494904363624-286aa59fa5c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZXJtYW55JTIwbXVuaWNoJTIwdW5pdmVyc2l0eSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzY2NzY3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 8,
      name: "University of Tokyo",
      shortName: "UTokyo",
      country: "Japan",
      flag: "🇯🇵",
      ranking: "#23",
      tuition: "¥535,800/year",
      acceptance: "34%",
      programs: ["Engineering", "Science", "Medicine"],
      location: "Tokyo, Japan",
      image: "https://images.unsplash.com/photo-1627892541952-ba3e1604a44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbiUyMHRva3lvJTIwdW5pdmVyc2l0eSUyMGNhbXB1c3xlbnwxfHx8fDE3NzY2NzY3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  const countries = ["All", ...Array.from(new Set(universities.map((u) => u.country)))];

  const filteredUniversities = universities.filter((uni) => {
    const matchesSearch =
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.programs.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCountry = selectedCountry === "All" || uni.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const toggleShortlist = (id: number) => {
    if (shortlisted.includes(id)) {
      setShortlisted(shortlisted.filter((uniId) => uniId !== id));
    } else {
      setShortlisted([...shortlisted, id]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl text-gray-900 mb-2">University Shortlist</h1>
          <p className="text-gray-600">
            Explore and shortlist universities that match your preferences
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search universities or programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredUniversities.length} universities • {shortlisted.length} shortlisted
          </div>
        </motion.div>

        {/* University Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((university, index) => (
            <motion.div
              key={university.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="h-40 relative overflow-hidden">
                <img 
                  src={university.image} 
                  alt={university.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 to-indigo-600/70" />
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{university.flag}</div>
                    <div className="text-sm opacity-90">{university.country}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleShortlist(university.id)}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    shortlisted.includes(university.id)
                      ? "bg-red-500 text-white"
                      : "bg-white/90 text-gray-600 hover:bg-white"
                  }`}
                >
                  <Heart
                    className="w-5 h-5"
                    fill={shortlisted.includes(university.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg text-gray-900 mb-1">{university.shortName}</h3>
                    <p className="text-sm text-gray-600">{university.name}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                    <Star className="w-3 h-3" />
                    {university.ranking}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {university.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    {university.tuition}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    Acceptance: {university.acceptance}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Popular Programs:</p>
                  <div className="flex flex-wrap gap-2">
                    {university.programs.slice(0, 2).map((program) => (
                      <span
                        key={program}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                      >
                        {program}
                      </span>
                    ))}
                    {university.programs.length > 2 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        +{university.programs.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredUniversities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No universities found matching your criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
