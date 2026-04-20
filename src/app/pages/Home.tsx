import { Link } from "react-router";
import { motion } from "motion/react";
import { Globe, BookOpen, MessageCircle, ChevronRight } from "lucide-react";

export default function Home() {
  const destinations = [
    { name: "United States", flag: "🇺🇸", image: "usa university campus" },
    { name: "United Kingdom", flag: "🇬🇧", image: "uk big ben university" },
    { name: "Australia", flag: "🇦🇺", image: "australia sydney opera house" },
    { name: "Japan", flag: "🇯🇵", image: "japan mount fuji cherry blossoms" },
  ];

  const features = [
    {
      icon: Globe,
      title: "Top Study Destinations",
      description: "Discover the best countries to study abroad.",
    },
    {
      icon: BookOpen,
      title: "Available Programs",
      description: "Explore courses and degrees tailored for you.",
    },
    {
      icon: MessageCircle,
      title: "Student Experiences",
      description: "Read reviews and stories from other students.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-5xl text-gray-900 mb-4">
                Explore the World,<br />
                <span className="text-blue-600">Expand Your Education</span>
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Find and apply to the best universities and programs around the globe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <select className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700">
                  <option>Select Destination</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>Canada</option>
                  <option>Japan</option>
                </select>
                <select className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700">
                  <option>Field of Study</option>
                  <option>Engineering</option>
                  <option>Business</option>
                  <option>Medicine</option>
                  <option>Arts</option>
                  <option>Computer Science</option>
                </select>
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Search
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src="../imports/image-1.png"
                alt="Study Abroad"
                className="rounded-lg shadow-2xl w-full"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl text-gray-900 text-center mb-8">
          Popular Study Abroad Destinations
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0 }}
            whileHover={{ scale: 1.05 }}
            className="relative h-48 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
          >
            <img 
              src="https://images.unsplash.com/photo-1772546392507-5ab8236031a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2ElMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc2Njc2NzU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
              alt="United States" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-indigo-600/80 group-hover:from-blue-600/90 group-hover:to-indigo-600/90 transition-all" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-5xl mb-2">🇺🇸</span>
              <span className="text-xl">United States</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="relative h-48 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
          >
            <img 
              src="https://images.unsplash.com/20/cambridge.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1ayUyMG94Zm9yZCUyMGNhbWJyaWRnZSUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzc2Njc2NzU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
              alt="United Kingdom" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-indigo-600/80 group-hover:from-blue-600/90 group-hover:to-indigo-600/90 transition-all" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-5xl mb-2">🇬🇧</span>
              <span className="text-xl">United Kingdom</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="relative h-48 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
          >
            <img 
              src="https://images.unsplash.com/photo-1693872398294-93f419e6475a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXN0cmFsaWElMjBzeWRuZXklMjB1bml2ZXJzaXR5JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc2Njc2NzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
              alt="Australia" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-indigo-600/80 group-hover:from-blue-600/90 group-hover:to-indigo-600/90 transition-all" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-5xl mb-2">🇦🇺</span>
              <span className="text-xl">Australia</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="relative h-48 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
          >
            <img 
              src="https://images.unsplash.com/photo-1627892541952-ba3e1604a44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbiUyMHRva3lvJTIwdW5pdmVyc2l0eSUyMGNhbXB1c3xlbnwxfHx8fDE3NzY2NzY3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
              alt="Japan" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-indigo-600/80 group-hover:from-blue-600/90 group-hover:to-indigo-600/90 transition-all" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-5xl mb-2">🇯🇵</span>
              <span className="text-xl">Japan</span>
            </div>
          </motion.div>
        </div>
        <div className="text-center">
          <Link
            to="/compare-countries"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Destinations
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1758610702484-b5126b2b50ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwY2VyZW1vbnklMjBpbnRlcm5hdGlvbmFsJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzc2Njc2NzU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Graduation"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl mb-4">Start Your Journey Today!</h2>
            <p className="text-lg mb-8 text-blue-100">
              Join thousands of students achieving their dreams abroad.
            </p>
            <Link
              to="/profile"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
