import { motion } from "motion/react";
import { Link } from "react-router";
import {
  GraduationCap,
  Globe,
  Building2,
  FileCheck,
  Map,
  TrendingUp,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    { label: "Countries Explored", value: "3", icon: Globe, color: "bg-blue-100 text-blue-600" },
    { label: "Universities Shortlisted", value: "8", icon: Building2, color: "bg-green-100 text-green-600" },
    { label: "Documents Ready", value: "5/12", icon: FileCheck, color: "bg-yellow-100 text-yellow-600" },
    { label: "Progress", value: "45%", icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
  ];

  const recentActivity = [
    { action: "Added MIT to shortlist", time: "2 hours ago", type: "university" },
    { action: "Compared USA vs UK", time: "1 day ago", type: "comparison" },
    { action: "Uploaded transcripts", time: "2 days ago", type: "document" },
    { action: "Updated profile information", time: "3 days ago", type: "profile" },
  ];

  const quickActions = [
    { title: "Compare Countries", icon: Globe, link: "/compare-countries", color: "bg-blue-600" },
    { title: "Find Universities", icon: Building2, link: "/universities", color: "bg-green-600" },
    { title: "Check Documents", icon: FileCheck, link: "/documents", color: "bg-yellow-600" },
    { title: "View Roadmap", icon: Map, link: "/roadmap", color: "bg-purple-600" },
  ];

  const upcomingDeadlines = [
    { university: "MIT", task: "Application Submission", date: "May 15, 2026" },
    { university: "Oxford", task: "Document Upload", date: "May 20, 2026" },
    { university: "Stanford", task: "Interview", date: "June 1, 2026" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative rounded-lg overflow-hidden"
        >
          <div className="relative h-32 sm:h-40">
            <img 
              src="https://images.unsplash.com/photo-1665317034392-cf5f4f487cd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBzdHVkeWluZyUyMGFicm9hZCUyMGNhbXB1c3xlbnwxfHx8fDE3NzY2NzAzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Study Abroad"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/80" />
            <div className="absolute inset-0 flex items-center px-8">
              <div className="text-white">
                <h1 className="text-3xl mb-2">Welcome back, Student!</h1>
                <p className="text-blue-100">Here's your study abroad journey overview</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl text-gray-900">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h2 className="text-xl text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link
                      to={action.link}
                      className={`block ${action.color} text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all`}
                    >
                      <Icon className="w-8 h-8 mb-3" />
                      <h3 className="text-lg">{action.title}</h3>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <h2 className="text-xl text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl text-gray-900 mb-4">Upcoming Deadlines</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{deadline.university}</p>
                        <p className="text-xs text-gray-600 mt-1">{deadline.task}</p>
                        <p className="text-xs text-blue-600 mt-1">{deadline.date}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link
                to="/roadmap"
                className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700"
              >
                View Full Roadmap →
              </Link>
            </div>

            {/* Progress Widget */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg mb-4">Your Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Completion</span>
                  <span>45%</span>
                </div>
                <div className="h-2 bg-blue-400 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "45%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Countries Compared</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-4 h-4 border-2 border-white rounded-full" />
                  <span>Final University Selection</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
