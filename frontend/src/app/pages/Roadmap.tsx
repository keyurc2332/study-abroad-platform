import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Circle, Clock } from "lucide-react";
import {
  STORAGE_KEYS,
  appendActivity,
  defaultRoadmap,
  recomputeRoadmapStatus,
  usePersistentState,
} from "../data/studyAbroadData";

export default function Roadmap() {
  const [milestones, setMilestones] = usePersistentState(STORAGE_KEYS.roadmap, defaultRoadmap);

  const toggleTask = (milestoneId: number, taskIndex: number) => {
    let updatedTaskName = "";

    const nextMilestones = recomputeRoadmapStatus(
      milestones.map((milestone) => {
        if (milestone.id !== milestoneId) {
          return milestone;
        }

        return {
          ...milestone,
          tasks: milestone.tasks.map((task, index) => {
            if (index !== taskIndex) {
              return task;
            }

            updatedTaskName = task.name;
            return { ...task, completed: !task.completed };
          }),
        };
      }),
    );

    setMilestones(nextMilestones);

    if (updatedTaskName) {
      appendActivity({
        action: `Updated roadmap task: ${updatedTaskName}`,
        path: "/roadmap",
        type: "roadmap",
      });
    }
  };

  const currentMilestone = milestones.find((milestone) => milestone.status === "in-progress");
  const completedMilestones = milestones.filter((milestone) => milestone.status === "completed").length;
  const totalProgress = Math.round((completedMilestones / Math.max(milestones.length, 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="relative overflow-hidden rounded-[28px]">
            <img
              src="https://images.unsplash.com/photo-1760907218396-6a8fb1a2fcb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcCUyMGdsb2JhbCUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NzY2NzY3NTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Study abroad roadmap"
              className="h-56 w-full object-cover sm:h-64"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700/95 to-indigo-700/95" />
            <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-white sm:px-8">
              <div>
                <h1 className="text-3xl sm:text-4xl">Study Abroad Roadmap</h1>
                <p className="mt-3 text-sm text-blue-100 sm:text-base">
                  Turn the roadmap into a working checklist by toggling each task as you move forward.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-lg sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl">
                {completedMilestones} / {milestones.length} Phases
              </h2>
              <p className="text-blue-100">Overall progress</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl">{totalProgress}%</div>
              <p className="text-sm text-blue-100">Complete</p>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-blue-400">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="h-full bg-white"
            />
          </div>
          {currentMilestone && (
            <div className="mt-4 border-t border-blue-400 pt-4">
              <p className="text-sm text-blue-100">Currently working on</p>
              <p className="mt-1 text-lg">{currentMilestone.title}</p>
            </div>
          )}
        </motion.div>

        <div className="relative">
          <div className="absolute bottom-0 left-4 top-0 hidden w-0.5 bg-gray-300 sm:block" />

          <div className="space-y-6 sm:space-y-8">
            {milestones.map((milestone, milestoneIndex) => (
              <motion.article
                key={milestone.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.15 + milestoneIndex * 0.06 }}
                className="relative sm:pl-16"
              >
                <div className="absolute left-0 top-0 hidden w-8 justify-center sm:flex">
                  {getStatusIcon(milestone.status)}
                </div>

                <div className="overflow-hidden rounded-[24px] bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm text-gray-500">{milestone.phase}</div>
                        <h3 className="mt-1 text-xl text-gray-900">{milestone.title}</h3>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{milestone.duration}</span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex self-start rounded-full border px-3 py-1 text-xs ${getStatusColor(
                          milestone.status,
                        )}`}
                      >
                        {milestone.status === "completed"
                          ? "Completed"
                          : milestone.status === "in-progress"
                            ? "In Progress"
                            : "Upcoming"}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2">
                      {milestone.tasks.map((task, taskIndex) => (
                        <button
                          key={task.name}
                          onClick={() => toggleTask(milestone.id, taskIndex)}
                          className="flex w-full items-center gap-3 rounded-2xl bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 flex-shrink-0 text-gray-400" />
                          )}
                          <span
                            className={`text-sm ${
                              task.completed ? "text-gray-500 line-through" : "text-gray-700"
                            }`}
                          >
                            {task.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    {milestone.status === "in-progress" && (
                      <div className="mt-5">
                        <div className="mb-2 flex justify-between text-xs text-gray-600">
                          <span>Phase Progress</span>
                          <span>
                            {milestone.tasks.filter((task) => task.completed).length} / {milestone.tasks.length}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                (milestone.tasks.filter((task) => task.completed).length /
                                  milestone.tasks.length) *
                                100
                              }%`,
                            }}
                            transition={{ duration: 0.6 }}
                            className="h-full bg-blue-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-10 rounded-[24px] border border-yellow-200 bg-yellow-50 p-5 sm:p-6"
        >
          <div className="flex gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-yellow-600" />
            <div>
              <h3 className="text-gray-900">Important reminders</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>Start at least 12 to 18 months before your intended intake.</li>
                <li>Deadlines vary by university and program, so verify each application window.</li>
                <li>Keep extra time for document processing and visa appointments.</li>
                <li>Maintain both digital and physical copies of key paperwork.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function getStatusColor(status: "completed" | "in-progress" | "pending") {
  switch (status) {
    case "completed":
      return "border-green-300 bg-green-100 text-green-700";
    case "in-progress":
      return "border-blue-300 bg-blue-100 text-blue-700";
    default:
      return "border-gray-300 bg-gray-100 text-gray-600";
  }
}

function getStatusIcon(status: "completed" | "in-progress" | "pending") {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    case "in-progress":
      return <Clock className="h-6 w-6 text-blue-600" />;
    default:
      return <Circle className="h-6 w-6 text-gray-400" />;
  }
}
