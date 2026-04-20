import { motion } from "motion/react";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";

export default function Roadmap() {
  const milestones = [
    {
      id: 1,
      phase: "Planning Phase",
      title: "Research & Self Assessment",
      status: "completed",
      duration: "Months 1-2",
      tasks: [
        { name: "Identify your field of study and career goals", completed: true },
        { name: "Research countries and universities", completed: true },
        { name: "Assess budget and financial requirements", completed: true },
        { name: "Check eligibility criteria", completed: true },
      ],
    },
    {
      id: 2,
      phase: "Preparation Phase",
      title: "Test Preparation & Documentation",
      status: "completed",
      duration: "Months 3-5",
      tasks: [
        { name: "Prepare for English proficiency tests (IELTS/TOEFL)", completed: true },
        { name: "Take standardized tests (GRE/GMAT if required)", completed: true },
        { name: "Gather academic transcripts and certificates", completed: true },
        { name: "Request letters of recommendation", completed: true },
      ],
    },
    {
      id: 3,
      phase: "Application Phase",
      title: "University Applications",
      status: "in-progress",
      duration: "Months 6-8",
      tasks: [
        { name: "Shortlist 8-10 universities", completed: true },
        { name: "Write Statement of Purpose (SOP)", completed: true },
        { name: "Prepare resume/CV", completed: false },
        { name: "Submit applications to universities", completed: false },
        { name: "Pay application fees", completed: false },
      ],
    },
    {
      id: 4,
      phase: "Decision Phase",
      title: "Offers & Selection",
      status: "pending",
      duration: "Months 9-10",
      tasks: [
        { name: "Wait for admission decisions", completed: false },
        { name: "Compare offers and scholarships", completed: false },
        { name: "Accept offer and pay deposit", completed: false },
        { name: "Request I-20/CAS/COE documents", completed: false },
      ],
    },
    {
      id: 5,
      phase: "Visa Phase",
      title: "Visa Application",
      status: "pending",
      duration: "Months 11-12",
      tasks: [
        { name: "Gather financial documents", completed: false },
        { name: "Complete visa application form", completed: false },
        { name: "Pay visa fees and book appointment", completed: false },
        { name: "Attend visa interview", completed: false },
        { name: "Receive visa approval", completed: false },
      ],
    },
    {
      id: 6,
      phase: "Pre-Departure Phase",
      title: "Travel & Accommodation",
      status: "pending",
      duration: "Month 13",
      tasks: [
        { name: "Book flight tickets", completed: false },
        { name: "Arrange accommodation", completed: false },
        { name: "Get medical insurance", completed: false },
        { name: "Attend pre-departure orientation", completed: false },
        { name: "Pack essentials", completed: false },
      ],
    },
    {
      id: 7,
      phase: "Arrival Phase",
      title: "Settling In",
      status: "pending",
      duration: "Month 14+",
      tasks: [
        { name: "Complete airport formalities", completed: false },
        { name: "University registration and orientation", completed: false },
        { name: "Open bank account", completed: false },
        { name: "Get local SIM card", completed: false },
        { name: "Explore campus and city", completed: false },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-300";
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case "in-progress":
        return <Clock className="w-6 h-6 text-blue-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const currentMilestone = milestones.find((m) => m.status === "in-progress");
  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const totalProgress = Math.round((completedMilestones / milestones.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Image */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative h-48 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1760907218396-6a8fb1a2fcb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcCUyMGdsb2JhbCUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NzY2NzY3NTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Study Abroad Roadmap"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 to-indigo-600/95 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl mb-2">Study Abroad Roadmap</h1>
                <p className="text-lg text-blue-100">Your step-by-step journey to studying abroad</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl mb-1">
                {completedMilestones} / {milestones.length} Phases
              </h2>
              <p className="text-blue-100">Overall Progress</p>
            </div>
            <div className="text-right">
              <div className="text-3xl">{totalProgress}%</div>
              <p className="text-sm text-blue-100">Complete</p>
            </div>
          </div>
          <div className="h-3 bg-blue-400 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-white"
            />
          </div>
          {currentMilestone && (
            <div className="mt-4 pt-4 border-t border-blue-400">
              <p className="text-sm text-blue-100 mb-1">Currently Working On:</p>
              <p className="text-lg">{currentMilestone.title}</p>
            </div>
          )}
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300" />

          {/* Milestones */}
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="relative pl-20"
              >
                {/* Timeline Icon */}
                <div className="absolute left-0 top-0 w-16 flex justify-center">
                  {getStatusIcon(milestone.status)}
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">{milestone.phase}</div>
                        <h3 className="text-xl text-gray-900 mb-2">{milestone.title}</h3>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{milestone.duration}</span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(
                          milestone.status
                        )}`}
                      >
                        {milestone.status === "completed"
                          ? "Completed"
                          : milestone.status === "in-progress"
                          ? "In Progress"
                          : "Upcoming"}
                      </span>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2">
                      {milestone.tasks.map((task, taskIndex) => (
                        <motion.div
                          key={taskIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 + index * 0.1 + taskIndex * 0.05 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm ${
                              task.completed ? "text-gray-500 line-through" : "text-gray-700"
                            }`}
                          >
                            {task.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Progress Bar for Current Milestone */}
                    {milestone.status === "in-progress" && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span>Phase Progress</span>
                          <span>
                            {milestone.tasks.filter((t) => t.completed).length} /{" "}
                            {milestone.tasks.length} tasks
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                (milestone.tasks.filter((t) => t.completed).length /
                                  milestone.tasks.length) *
                                100
                              }%`,
                            }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-blue-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-12"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="text-gray-900 mb-2">Important Reminders</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Start your application process at least 12-18 months before your intended start date</li>
                <li>• Application deadlines vary by university and program - check individual requirements</li>
                <li>• Some universities have rolling admissions while others have strict deadlines</li>
                <li>• Budget extra time for unexpected delays in document processing or visa appointments</li>
                <li>• Keep digital and physical copies of all important documents</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
