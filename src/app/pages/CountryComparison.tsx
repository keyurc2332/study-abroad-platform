import { motion } from "motion/react";
import { useState } from "react";
import { DollarSign, GraduationCap, Clock, Globe2, Briefcase, TrendingUp } from "lucide-react";

export default function CountryComparison() {
  const [selectedCountries, setSelectedCountries] = useState(["United States", "United Kingdom"]);

  const availableCountries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "Japan",
    "Singapore",
    "Netherlands",
  ];

  const countryData = {
    "United States": {
      flag: "🇺🇸",
      image: "https://images.unsplash.com/photo-1772546392507-5ab8236031a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2ElMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc2Njc2NzU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tuitionRange: "$20,000 - $50,000",
      livingCost: "$12,000 - $18,000",
      studyDuration: "2 years (Master's)",
      topUniversities: ["MIT", "Stanford", "Harvard", "Yale"],
      workOpportunities: "Excellent (OPT, H1B)",
      languageRequirement: "IELTS 6.5+ / TOEFL 90+",
      applicationDeadline: "Jan - Apr",
      visaProcessing: "2-3 months",
      postStudyWork: "3 years (STEM)",
    },
    "United Kingdom": {
      flag: "🇬🇧",
      image: "https://images.unsplash.com/20/cambridge.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1ayUyMG94Zm9yZCUyMGNhbWJyaWRnZSUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzc2Njc2NzU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tuitionRange: "£15,000 - £35,000",
      livingCost: "£12,000 - £15,000",
      studyDuration: "1 year (Master's)",
      topUniversities: ["Oxford", "Cambridge", "Imperial", "LSE"],
      workOpportunities: "Good (Graduate Visa)",
      languageRequirement: "IELTS 6.5+ / TOEFL 90+",
      applicationDeadline: "Sep - Jan",
      visaProcessing: "3-4 weeks",
      postStudyWork: "2 years",
    },
    "Canada": {
      flag: "🇨🇦",
      image: "https://images.unsplash.com/photo-1618255630366-f402c45736f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5hZGElMjB0b3JvbnRvJTIwdW5pdmVyc2l0eSUyMGNhbXB1c3xlbnwxfHx8fDE3NzY2NzY3NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tuitionRange: "CAD $15,000 - $35,000",
      livingCost: "CAD $10,000 - $15,000",
      studyDuration: "2 years (Master's)",
      topUniversities: ["Toronto", "UBC", "McGill", "Waterloo"],
      workOpportunities: "Excellent (PGWP, PR pathway)",
      languageRequirement: "IELTS 6.5+ / TOEFL 90+",
      applicationDeadline: "Jan - Mar",
      visaProcessing: "4-6 weeks",
      postStudyWork: "3 years",
    },
    "Australia": {
      flag: "🇦🇺",
      image: "https://images.unsplash.com/photo-1693872398294-93f419e6475a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXN0cmFsaWElMjBzeWRuZXklMjB1bml2ZXJzaXR5JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc2Njc2NzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tuitionRange: "AUD $20,000 - $45,000",
      livingCost: "AUD $20,000 - $25,000",
      studyDuration: "2 years (Master's)",
      topUniversities: ["Melbourne", "Sydney", "ANU", "UNSW"],
      workOpportunities: "Good (TSS, Skilled migration)",
      languageRequirement: "IELTS 6.5+ / TOEFL 79+",
      applicationDeadline: "Feb - Jul",
      visaProcessing: "4-6 weeks",
      postStudyWork: "2-4 years",
    },
    "Germany": {
      flag: "🇩🇪",
      image: "https://images.unsplash.com/photo-1494904363624-286aa59fa5c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZXJtYW55JTIwbXVuaWNoJTIwdW5pdmVyc2l0eSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzY2NzY3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tuitionRange: "€0 - €20,000 (Public universities often free)",
      livingCost: "€10,000 - €12,000",
      studyDuration: "2 years (Master's)",
      topUniversities: ["TUM", "LMU Munich", "Heidelberg", "RWTH Aachen"],
      workOpportunities: "Good (18 months job seeker visa)",
      languageRequirement: "IELTS 6.0+ or German B2",
      applicationDeadline: "May - Jul (Winter), Dec (Summer)",
      visaProcessing: "6-8 weeks",
      postStudyWork: "18 months",
    },
    "Japan": {
      flag: "🇯🇵",
      image: "https://images.unsplash.com/photo-1627892541952-ba3e1604a44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbiUyMHRva3lvJTIwdW5pdmVyc2l0eSUyMGNhbXB1c3xlbnwxfHx8fDE3NzY2NzY3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tuitionRange: "¥500,000 - ¥1,500,000",
      livingCost: "¥1,000,000 - ¥1,500,000",
      studyDuration: "2 years (Master's)",
      topUniversities: ["Tokyo", "Kyoto", "Osaka", "Tohoku"],
      workOpportunities: "Good (Engineer visa)",
      languageRequirement: "JLPT N2 or IELTS 6.0+",
      applicationDeadline: "Sep - Nov",
      visaProcessing: "2-3 months",
      postStudyWork: "1 year (extendable)",
    },
    "Singapore": {
      flag: "🇸🇬",
      image: "https://images.unsplash.com/photo-1759823420520-546e46818322?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjB1bml2ZXJzaXR5JTIwbW9kZXJuJTIwY2FtcHVzfGVufDF8fHx8MTc3NjY3Njc1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tuitionRange: "SGD $30,000 - $50,000",
      livingCost: "SGD $12,000 - $18,000",
      studyDuration: "1-2 years (Master's)",
      topUniversities: ["NUS", "NTU", "SMU"],
      workOpportunities: "Excellent (Employment Pass)",
      languageRequirement: "IELTS 6.5+ / TOEFL 85+",
      applicationDeadline: "Nov - Feb",
      visaProcessing: "2-4 weeks",
      postStudyWork: "1 year",
    },
    "Netherlands": {
      flag: "🇳🇱",
      image: "https://images.unsplash.com/photo-1664054135532-df441aed0af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXRoZXJsYW5kcyUyMGFtc3RlcmRhbSUyMHVuaXZlcnNpdHklMjBidWlsZGluZ3xlbnwxfHx8fDE3NzY2NzY3NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tuitionRange: "€8,000 - €20,000",
      livingCost: "€10,000 - €13,000",
      studyDuration: "1-2 years (Master's)",
      topUniversities: ["Delft", "Amsterdam", "Leiden", "Utrecht"],
      workOpportunities: "Good (Orientation year)",
      languageRequirement: "IELTS 6.5+ / TOEFL 90+",
      applicationDeadline: "Dec - May",
      visaProcessing: "2-4 weeks",
      postStudyWork: "1 year",
    },
  };

  const comparisonCategories = [
    { key: "tuitionRange", label: "Tuition Fees", icon: DollarSign },
    { key: "livingCost", label: "Living Cost", icon: DollarSign },
    { key: "studyDuration", label: "Study Duration", icon: Clock },
    { key: "languageRequirement", label: "Language Requirement", icon: Globe2 },
    { key: "workOpportunities", label: "Work Opportunities", icon: Briefcase },
    { key: "postStudyWork", label: "Post-Study Work", icon: TrendingUp },
  ];

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
          <h1 className="text-3xl text-gray-900 mb-2">Compare Countries</h1>
          <p className="text-gray-600">Compare study destinations side by side</p>
        </motion.div>

        {/* Country Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <h2 className="text-lg text-gray-900 mb-4">Select Countries to Compare (up to 3)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {availableCountries.map((country) => (
              <button
                key={country}
                onClick={() => {
                  if (selectedCountries.includes(country)) {
                    setSelectedCountries(selectedCountries.filter((c) => c !== country));
                  } else if (selectedCountries.length < 3) {
                    setSelectedCountries([...selectedCountries, country]);
                  }
                }}
                className={`p-3 border rounded-lg text-sm transition-all ${
                  selectedCountries.includes(country)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                }`}
              >
                <span className="text-2xl mb-2 block">
                  {countryData[country as keyof typeof countryData]?.flag}
                </span>
                {country}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Comparison Table */}
        {selectedCountries.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm text-gray-900">Category</th>
                    {selectedCountries.map((country) => (
                      <th key={country} className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-white shadow-lg">
                            <img
                              src={countryData[country as keyof typeof countryData]?.image}
                              alt={country}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-2xl">
                              {countryData[country as keyof typeof countryData]?.flag}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">{country}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonCategories.map((category, index) => {
                    const Icon = category.icon;
                    return (
                      <motion.tr
                        key={category.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Icon className="w-4 h-4 text-blue-600" />
                            {category.label}
                          </div>
                        </td>
                        {selectedCountries.map((country) => (
                          <td key={country} className="px-6 py-4 text-sm text-gray-700">
                            {countryData[country as keyof typeof countryData]?.[category.key as keyof typeof countryData.Canada]}
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        Top Universities
                      </div>
                    </td>
                    {selectedCountries.map((country) => (
                      <td key={country} className="px-6 py-4">
                        <div className="space-y-1">
                          {countryData[country as keyof typeof countryData]?.topUniversities.map((uni) => (
                            <div key={uni} className="text-sm text-gray-700">• {uni}</div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <Globe2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Select at least one country to start comparing</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
