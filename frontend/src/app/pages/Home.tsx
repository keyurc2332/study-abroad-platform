import { Link } from "react-router";
import { motion } from "motion/react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Globe,
  GraduationCap,
  MessageCircle,
  Plane,
  Search,
  Star,
  User,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Globe,
      title: "Top Study Destinations",
      description: "Discover the best countries to study abroad.",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: BookOpen,
      title: "Available Programs",
      description: "Explore courses and degrees tailored for you.",
      color: "from-emerald-400 to-teal-600",
    },
    {
      icon: MessageCircle,
      title: "Student Experiences",
      description: "Read real reviews and stories from other students.",
      color: "from-violet-500 to-indigo-600",
    },
  ];

  const destinations = [
    {
      code: "US",
      name: "United States",
      description: "Top universities & diverse opportunities",
      image:
        "https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=900&q=80",
    },
    {
      code: "GB",
      name: "United Kingdom",
      description: "World-class education & global exposure",
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80",
    },
    {
      code: "AU",
      name: "Australia",
      description: "High-quality education & vibrant lifestyle",
      image:
        "https://images.unsplash.com/photo-1523428096881-5bd79d043006?auto=format&fit=crop&w=900&q=80",
    },
    {
      code: "DE",
      name: "Germany",
      description: "Affordable education & strong career pathways",
      image:
        "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80",
    },
  ];

  const avatarUrls = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80",
    "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80",
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  const sectionReveal = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const smoothEase = [0.22, 1, 0.36, 1] as const;

  return (
    <main className="px-3 pb-4 sm:px-4 lg:px-5">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: smoothEase }}
        className="mx-auto max-w-[1500px] overflow-hidden rounded-b-[28px] bg-white shadow-[0_28px_90px_rgba(37,99,235,0.12)]"
      >
        <section className="relative min-h-[660px] overflow-hidden bg-[linear-gradient(112deg,#ffffff_0%,#fbfdff_45%,#edf5ff_100%)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 0.35, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="absolute right-14 top-24 hidden grid-cols-7 gap-3 lg:grid"
          >
            {Array.from({ length: 42 }).map((_, index) => (
              <span key={index} className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -28, y: 18 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.75, delay: 0.35, ease: smoothEase }}
            className="absolute -left-9 bottom-8 z-10 hidden h-48 w-32 lg:block"
          >
            <div className="absolute bottom-0 left-8 h-14 w-16 rounded-b-[28px] rounded-t-lg bg-gradient-to-b from-slate-100 to-slate-300 shadow-xl" />
            {[-42, -25, -8, 10, 28, 45].map((rotate, index) => (
              <span
                key={rotate}
                className="absolute bottom-12 left-12 h-28 w-8 origin-bottom rounded-full bg-gradient-to-br from-emerald-300 to-green-700 shadow-sm"
                style={{
                  transform: `rotate(${rotate}deg) translateY(${index % 2 === 0 ? 0 : -10}px)`,
                }}
              />
            ))}
          </motion.div>

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center px-6 pb-28 pt-20 sm:px-10 lg:grid-cols-[0.83fr_1.17fr] lg:px-16 lg:pb-32 lg:pt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: smoothEase }}
              className="relative z-20"
            >
              <h1 className="max-w-[620px] text-[44px] leading-[1.12] text-slate-950 sm:text-[56px] lg:text-[58px]">
                Explore the World,
                <span className="block text-blue-600">Expand Your Education</span>
              </h1>
              <p className="mt-5 max-w-[500px] text-lg leading-8 text-slate-600">
                Find and apply to the best universities and programs around the globe.
              </p>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={sectionReveal}
                className="mt-9 flex max-w-[650px] flex-col gap-4 sm:flex-row"
              >
                <motion.button
                  variants={fadeUp}
                  transition={{ duration: 0.45, ease: smoothEase }}
                  whileHover={{ y: -3, boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex h-14 flex-1 items-center justify-between rounded-xl border border-slate-200 bg-white px-5 text-sm text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                >
                  <span className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-blue-600" />
                    Select Destination
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </motion.button>
                <motion.button
                  variants={fadeUp}
                  transition={{ duration: 0.45, ease: smoothEase }}
                  whileHover={{ y: -3, boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex h-14 flex-1 items-center justify-between rounded-xl border border-slate-200 bg-white px-5 text-sm text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                >
                  <span className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    Field of Study
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </motion.button>
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.45, ease: smoothEase }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/dashboard"
                    className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-8 text-sm text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)] transition-colors hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.48, ease: smoothEase }}
                className="mt-10 flex flex-wrap items-center gap-5"
              >
                <div className="flex -space-x-3">
                  {avatarUrls.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-[auto_auto] items-center gap-x-4">
                  <p className="max-w-40 text-sm leading-6 text-slate-600">
                    Trusted by <span className="text-slate-900">10K+ students</span> worldwide
                  </p>
                  <div className="flex gap-1 text-emerald-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: smoothEase }}
              className="relative z-10 mt-10 h-[340px] lg:mt-0 lg:h-[560px]"
            >
              <div className="absolute inset-0">
                <div className="absolute bottom-5 left-5 h-24 w-[88%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.22),rgba(37,99,235,0.08)_45%,transparent_72%)] blur-2xl" />
                <div className="absolute left-[13%] top-[7%] aspect-square w-[68%] max-w-[510px]">
                  <div className="absolute left-[2%] top-[7%] aspect-square w-[88%] rounded-full border-[13px] border-slate-400/75 border-r-slate-300/50 border-t-slate-200/80 shadow-[inset_12px_0_20px_rgba(255,255,255,0.35),0_18px_34px_rgba(15,23,42,0.16)]" />
                  <div className="absolute left-[38%] top-[81%] h-[15%] w-[5%] rounded-b-full bg-[linear-gradient(90deg,#475569,#f8fafc_45%,#334155)] shadow-md" />
                  <div className="absolute left-[27%] top-[94%] h-[7%] w-[30%] rounded-full bg-[linear-gradient(90deg,#64748b,#ffffff_45%,#475569)] shadow-[0_14px_22px_rgba(15,23,42,0.18)]" />

                  <div className="absolute left-[14%] top-[7%] aspect-square w-[84%] overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_22%,#f7fdff_0%,#a9e7ff_15%,#48bdf6_34%,#0b84df_58%,#0750b8_100%)] shadow-[inset_-34px_-36px_60px_rgba(15,23,42,0.34),inset_22px_20px_42px_rgba(255,255,255,0.72),0_28px_60px_rgba(37,99,235,0.34)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.95),rgba(255,255,255,0.45)_13%,transparent_31%)]" />
                    <div className="absolute -left-[8%] top-[4%] h-[98%] w-[55%] rounded-full border border-white/45" />
                    <div className="absolute left-[27%] top-[-9%] h-[118%] w-[30%] rounded-full border border-white/36" />
                    <div className="absolute left-[57%] top-[-5%] h-[108%] w-[22%] rounded-full border border-white/22" />
                    <div className="absolute inset-x-0 top-[31%] h-px bg-white/30" />
                    <div className="absolute inset-x-0 top-[47%] h-px bg-white/35" />
                    <div className="absolute inset-x-3 top-[63%] h-px bg-white/24" />

                    <div className="absolute left-[13%] top-[20%] h-[22%] w-[31%] rounded-[48%] bg-[radial-gradient(circle,rgba(255,255,255,0.86)_1.4px,transparent_1.8px)] [background-size:7px_7px] opacity-90" />
                    <div className="absolute left-[19%] top-[40%] h-[31%] w-[22%] rotate-[-12deg] rounded-[48%] bg-[radial-gradient(circle,rgba(255,255,255,0.76)_1.3px,transparent_1.8px)] [background-size:7px_7px] opacity-80" />
                    <div className="absolute left-[42%] top-[19%] h-[26%] w-[26%] rounded-[50%] bg-[radial-gradient(circle,rgba(255,255,255,0.82)_1.3px,transparent_1.8px)] [background-size:7px_7px] opacity-85" />
                    <div className="absolute left-[58%] top-[31%] h-[46%] w-[26%] rotate-12 rounded-[48%] bg-[radial-gradient(circle,rgba(255,255,255,0.7)_1.3px,transparent_1.8px)] [background-size:7px_7px] opacity-78" />

                    {[
                      ["left-[30%]", "top-[31%]"],
                      ["left-[51%]", "top-[47%]"],
                      ["left-[25%]", "top-[68%]"],
                      ["left-[76%]", "top-[42%]"],
                    ].map(([left, top]) => (
                      <span
                        key={`${left}-${top}`}
                        className={`absolute ${left} ${top} h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_8px_16px_rgba(15,23,42,0.18)] before:absolute before:left-1/2 before:top-[66%] before:h-4 before:w-4 before:-translate-x-1/2 before:rotate-45 before:rounded-sm before:bg-white after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-3 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-blue-600`}
                      />
                    ))}

                    <div className="absolute left-[-12%] top-[41%] h-[34%] w-[132%] rotate-[-18deg] rounded-full border-t-[9px] border-white shadow-[0_-1px_14px_rgba(255,255,255,0.95),0_5px_16px_rgba(37,99,235,0.24)]" />
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/55" />
                    <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.32)_0%,transparent_38%,rgba(15,23,42,0.2)_100%)]" />
                  </div>

                  <motion.div
                    aria-hidden="true"
                    className="absolute left-[5%] top-[-3%] aspect-square w-[104%] rounded-full border-2 border-dashed border-blue-500/60"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Plane className="absolute right-[6%] top-[11%] h-14 w-14 rotate-[28deg] fill-blue-600 text-blue-600 drop-shadow-[0_8px_10px_rgba(37,99,235,0.28)]" />
                  </motion.div>
                </div>

                <div className="absolute bottom-[6%] right-[-5%] h-[36%] w-[44%] min-w-[250px]">
                  <div className="absolute bottom-[-4%] left-[3%] h-[22%] w-[90%] rounded-[50%] bg-slate-900/18 blur-xl" />
                  <div className="absolute bottom-0 h-[34%] w-[94%] rotate-[-4deg] rounded-xl border border-blue-200 bg-gradient-to-r from-blue-700 via-blue-400 to-blue-100 shadow-[0_16px_28px_rgba(15,23,42,0.2)]">
                    <div className="absolute left-[10%] top-[17%] h-[66%] w-[78%] rounded-md bg-[repeating-linear-gradient(0deg,#ffffff_0px,#ffffff_4px,#e2e8f0_5px)]" />
                    <div className="absolute right-4 top-4 h-[70%] w-3 rounded-full bg-blue-800/55" />
                  </div>
                  <div className="absolute bottom-[27%] left-[4%] h-[30%] w-[94%] rotate-[3deg] rounded-xl border border-orange-200 bg-gradient-to-r from-orange-500 via-amber-200 to-white shadow-[0_14px_24px_rgba(15,23,42,0.16)]">
                    <div className="absolute left-[8%] top-[17%] h-[66%] w-[80%] rounded-md bg-[repeating-linear-gradient(0deg,#ffffff_0px,#ffffff_4px,#e5e7eb_5px)]" />
                  </div>
                  <div className="absolute bottom-[51%] left-[1%] h-[31%] w-[96%] rotate-[-2deg] rounded-xl border border-blue-200 bg-gradient-to-r from-sky-700 via-sky-300 to-white shadow-[0_14px_24px_rgba(15,23,42,0.16)]">
                    <div className="absolute left-[9%] top-[17%] h-[66%] w-[79%] rounded-md bg-[repeating-linear-gradient(0deg,#ffffff_0px,#ffffff_4px,#e2e8f0_5px)]" />
                  </div>
                  <div className="absolute bottom-[73%] left-[25%] flex h-[28%] w-[45%] items-center justify-center rounded-b-[48%] bg-[linear-gradient(145deg,#0f172a,#020617)] shadow-[0_18px_28px_rgba(15,23,42,0.3)]">
                    <GraduationCap className="absolute -top-12 h-28 w-28 rotate-3 fill-slate-950 text-slate-950 drop-shadow-[0_12px_12px_rgba(15,23,42,0.25)]" />
                    <span className="absolute right-0 top-0 h-14 w-1 rotate-[-18deg] rounded-full bg-gradient-to-b from-yellow-300 to-amber-500" />
                    <span className="absolute right-[-6px] top-12 h-9 w-4 rounded-b-full bg-gradient-to-b from-yellow-300 to-amber-500 shadow-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[92px] bg-[linear-gradient(96deg,rgba(37,99,235,0.98)_0%,rgba(59,130,246,0.85)_34%,rgba(124,58,237,0.58)_72%,rgba(147,197,253,0.75)_100%)] [clip-path:polygon(0_53%,17%_68%,39%_33%,63%_30%,82%_50%,100%_42%,100%_100%,0_100%)]" />
        </section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={sectionReveal}
          className="relative z-20 -mt-12 px-6 sm:px-10 lg:px-16"
        >
          <div className="mx-auto grid max-w-7xl gap-9 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5, ease: smoothEase }}
                  whileHover={{ y: -8, scale: 1.015 }}
                  className="group flex h-[150px] items-center gap-6 rounded-2xl border border-slate-200 bg-white px-7 shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
                >
                  <div
                    className={`flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${feature.color} text-white shadow-lg`}
                  >
                    <Icon className="h-9 w-9" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg text-slate-950">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={sectionReveal}
          className="px-6 py-[70px] sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-7xl">
            <motion.div variants={fadeUp} className="mb-12 flex items-center justify-center gap-6">
              <span className="hidden h-px w-32 bg-gradient-to-r from-transparent to-blue-400 sm:block" />
              <span className="hidden h-2 w-2 rounded-full bg-blue-600 sm:block" />
              <h2 className="text-center text-3xl text-slate-950">
                Popular Study Abroad Destinations
              </h2>
              <span className="hidden h-2 w-2 rounded-full bg-blue-600 sm:block" />
              <span className="hidden h-px w-32 bg-gradient-to-l from-transparent to-blue-400 sm:block" />
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {destinations.map((destination) => (
                <motion.article
                  key={destination.name}
                  variants={fadeUp}
                  transition={{ duration: 0.5, ease: smoothEase }}
                  whileHover={{ y: -8, scale: 1.015 }}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
                >
                  <div className="h-[205px] overflow-hidden">
                    <motion.img
                      src={destination.image}
                      alt={destination.name}
                      whileHover={{ scale: 1.06 }}
                      transition={{ duration: 0.5, ease: smoothEase }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="relative h-[128px] p-5 pt-6">
                    <div className="absolute -top-7 left-5 flex h-14 w-16 items-center justify-center rounded-lg border-2 border-white bg-gradient-to-br from-blue-500 to-blue-700 text-xl text-white shadow-lg">
                      {destination.code}
                    </div>
                    <h3 className="ml-[78px] text-lg text-blue-900">{destination.name}</h3>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="text-sm leading-6 text-slate-600">{destination.description}</p>
                      <Link
                        to="/compare-countries"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-blue-600"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-9 text-center">
              <motion.div
                className="inline-flex"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/compare-countries"
                  className="inline-flex h-[52px] items-center gap-3 rounded-xl bg-blue-600 px-9 text-white shadow-[0_14px_28px_rgba(37,99,235,0.24)] transition-colors hover:bg-blue-700"
                >
                  View All Destinations
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 34, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: smoothEase }}
          className="px-6 pb-6 sm:px-10 lg:px-10"
        >
          <div className="relative mx-auto min-h-[335px] max-w-[1420px] overflow-hidden rounded-[28px] bg-blue-700 text-white">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80"
              alt="Students planning together"
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-700/95 to-indigo-600/65" />
            <div className="absolute bottom-8 left-8 hidden grid-cols-5 gap-2 opacity-45 md:grid">
              {Array.from({ length: 25 }).map((_, index) => (
                <span key={index} className="h-1.5 w-1.5 rounded-full bg-white" />
              ))}
            </div>
            <div className="relative px-8 py-14 sm:px-14 lg:px-28">
              <h2 className="text-3xl sm:text-4xl">Start Your Journey Today!</h2>
              <p className="mt-4 max-w-2xl text-lg text-blue-50">
                Join thousands of students achieving their dreams abroad.
              </p>
              <div className="mt-8 flex flex-wrap gap-10 text-sm text-blue-50">
                <span className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  Personalized Guidance
                </span>
                <span className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  Easy Application Process
                </span>
                <span className="flex items-center gap-3">
                  <Globe className="h-5 w-5" />
                  Global Opportunities
                </span>
              </div>
              <motion.div
                className="inline-flex"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/profile"
                  className="mt-9 inline-flex h-14 items-center gap-4 rounded-xl bg-white px-10 text-blue-700 shadow-lg transition-colors hover:bg-blue-50"
                >
                  Get Started
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </main>
  );
}
