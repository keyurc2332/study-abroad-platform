import { useEffect, useState } from "react";

export type ActivityType =
  | "profile"
  | "comparison"
  | "university"
  | "document"
  | "roadmap";

export type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  currentEducation: string;
  gpa: string;
  desiredDegree: string;
  preferredCountries: string[];
  fieldOfStudy: string;
  budgetRange: string;
  englishProficiency: string;
  workExperience: string;
};

export type University = {
  id: number;
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  ranking: string;
  tuition: string;
  acceptance: string;
  programs: string[];
  location: string;
  image: string;
  applicationDeadline: string;
};

export type DocumentStatus = "not-started" | "pending" | "completed";

export type DocumentItem = {
  id: number;
  name: string;
  description: string;
  status: DocumentStatus;
  required: boolean;
  uploadDate: string | null;
};

export type MilestoneTask = {
  name: string;
  completed: boolean;
};

export type RoadmapMilestone = {
  id: number;
  phase: string;
  title: string;
  status: "completed" | "in-progress" | "pending";
  duration: string;
  tasks: MilestoneTask[];
};

export type ActivityItem = {
  id: string;
  action: string;
  type: ActivityType;
  path: string;
  createdAt: string;
};

export const STORAGE_KEYS = {
  profile: "study-abroad-profile",
  shortlistedUniversityIds: "study-abroad-shortlisted-university-ids",
  comparisonCountries: "study-abroad-comparison-countries",
  documents: "study-abroad-documents",
  roadmap: "study-abroad-roadmap",
  activities: "study-abroad-activities",
} as const;

export const defaultProfile: ProfileData = {
  fullName: "Aarav Sharma",
  email: "aarav.sharma@email.com",
  phone: "+91 98765 43210",
  dateOfBirth: "2001-05-15",
  currentEducation: "B.Tech in Computer Science",
  gpa: "8.4/10",
  desiredDegree: "Master's",
  preferredCountries: ["United States", "United Kingdom", "Canada"],
  fieldOfStudy: "Computer Science",
  budgetRange: "$30,000 - $50,000",
  englishProficiency: "IELTS 7.5",
  workExperience: "2 years",
};

export const universities: University[] = [
  {
    id: 1,
    name: "Massachusetts Institute of Technology",
    shortName: "MIT",
    country: "United States",
    countryCode: "US",
    ranking: "#1",
    tuition: "$53,790/year",
    acceptance: "3.9%",
    programs: ["Computer Science", "Engineering", "Business"],
    location: "Cambridge, MA",
    image:
      "https://images.unsplash.com/photo-1772546392507-5ab8236031a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2ElMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc2Njc2NzU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    applicationDeadline: "2026-05-15",
  },
  {
    id: 2,
    name: "University of Oxford",
    shortName: "Oxford",
    country: "United Kingdom",
    countryCode: "UK",
    ranking: "#2",
    tuition: "GBP 26,770/year",
    acceptance: "17.5%",
    programs: ["Law", "Medicine", "Philosophy"],
    location: "Oxford, UK",
    image:
      "https://images.unsplash.com/20/cambridge.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1ayUyMG94Zm9yZCUyMGNhbWJyaWRnZSUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzc2Njc2NzU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    applicationDeadline: "2026-05-20",
  },
  {
    id: 3,
    name: "Stanford University",
    shortName: "Stanford",
    country: "United States",
    countryCode: "US",
    ranking: "#3",
    tuition: "$56,169/year",
    acceptance: "4.3%",
    programs: ["Computer Science", "Business", "Engineering"],
    location: "Stanford, CA",
    image:
      "https://images.unsplash.com/photo-1772546392507-5ab8236031a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2ElMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc2Njc2NzU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    applicationDeadline: "2026-06-01",
  },
  {
    id: 4,
    name: "University of Cambridge",
    shortName: "Cambridge",
    country: "United Kingdom",
    countryCode: "UK",
    ranking: "#4",
    tuition: "GBP 24,507/year",
    acceptance: "21%",
    programs: ["Mathematics", "Engineering", "Natural Sciences"],
    location: "Cambridge, UK",
    image:
      "https://images.unsplash.com/20/cambridge.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1ayUyMG94Zm9yZCUyMGNhbWJyaWRnZSUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzc2Njc2NzU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    applicationDeadline: "2026-06-10",
  },
  {
    id: 5,
    name: "University of Toronto",
    shortName: "UofT",
    country: "Canada",
    countryCode: "CA",
    ranking: "#18",
    tuition: "CAD 58,160/year",
    acceptance: "43%",
    programs: ["Computer Science", "Business", "Medicine"],
    location: "Toronto, ON",
    image:
      "https://images.unsplash.com/photo-1618255630366-f402c45736f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5hZGElMjB0b3JvbnRvJTIwdW5pdmVyc2l0eSUyMGNhbXB1c3xlbnwxfHx8fDE3NzY2NzY3NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    applicationDeadline: "2026-06-18",
  },
  {
    id: 6,
    name: "University of Melbourne",
    shortName: "Melbourne",
    country: "Australia",
    countryCode: "AU",
    ranking: "#14",
    tuition: "AUD 45,824/year",
    acceptance: "70%",
    programs: ["Medicine", "Engineering", "Business"],
    location: "Melbourne, VIC",
    image:
      "https://images.unsplash.com/photo-1693872398294-93f419e6475a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXN0cmFsaWElMjBzeWRuZXklMjB1bml2ZXJzaXR5JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc2Njc2NzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    applicationDeadline: "2026-07-02",
  },
  {
    id: 7,
    name: "Technical University of Munich",
    shortName: "TUM",
    country: "Germany",
    countryCode: "DE",
    ranking: "#49",
    tuition: "EUR 0 (public)",
    acceptance: "8%",
    programs: ["Engineering", "Computer Science", "Physics"],
    location: "Munich, Germany",
    image:
      "https://images.unsplash.com/photo-1494904363624-286aa59fa5c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZXJtYW55JTIwbXVuaWNoJTIwdW5pdmVyc2l0eSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzY2NzY3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    applicationDeadline: "2026-07-12",
  },
  {
    id: 8,
    name: "University of Tokyo",
    shortName: "UTokyo",
    country: "Japan",
    countryCode: "JP",
    ranking: "#23",
    tuition: "JPY 535,800/year",
    acceptance: "34%",
    programs: ["Engineering", "Science", "Medicine"],
    location: "Tokyo, Japan",
    image:
      "https://images.unsplash.com/photo-1627892541952-ba3e1604a44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbiUyMHRva3lvJTIwdW5pdmVyc2l0eSUyMGNhbXB1c3xlbnwxfHx8fDE3NzY2NzY3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    applicationDeadline: "2026-08-01",
  },
];

export const defaultShortlistedUniversityIds: string[] = [];

export const defaultComparisonCountries = ["United States", "United Kingdom"];

export const defaultDocuments: DocumentItem[] = [
  {
    id: 1,
    name: "Academic Transcripts",
    description: "Official transcripts from all institutions attended",
    status: "completed",
    required: true,
    uploadDate: "2026-04-01",
  },
  {
    id: 2,
    name: "Passport Copy",
    description: "Valid passport with at least 6 months validity",
    status: "completed",
    required: true,
    uploadDate: "2026-03-28",
  },
  {
    id: 3,
    name: "English Proficiency Test",
    description: "IELTS, TOEFL, or equivalent test scores",
    status: "completed",
    required: true,
    uploadDate: "2026-04-05",
  },
  {
    id: 4,
    name: "Statement of Purpose",
    description: "Personal essay explaining your academic goals",
    status: "completed",
    required: true,
    uploadDate: "2026-04-10",
  },
  {
    id: 5,
    name: "Letters of Recommendation",
    description: "2-3 letters from professors or employers",
    status: "completed",
    required: true,
    uploadDate: "2026-04-08",
  },
  {
    id: 6,
    name: "Resume/CV",
    description: "Updated resume highlighting relevant experience",
    status: "pending",
    required: true,
    uploadDate: null,
  },
  {
    id: 7,
    name: "Financial Documents",
    description: "Bank statements or sponsorship letters",
    status: "pending",
    required: true,
    uploadDate: null,
  },
  {
    id: 8,
    name: "Standardized Test Scores",
    description: "GRE/GMAT scores if required by university",
    status: "pending",
    required: false,
    uploadDate: null,
  },
  {
    id: 9,
    name: "Portfolio",
    description: "For creative or design programs",
    status: "pending",
    required: false,
    uploadDate: null,
  },
  {
    id: 10,
    name: "Copy of Degree Certificate",
    description: "Bachelor's degree or equivalent",
    status: "pending",
    required: true,
    uploadDate: null,
  },
  {
    id: 11,
    name: "Visa Application Form",
    description: "Completed visa application",
    status: "not-started",
    required: true,
    uploadDate: null,
  },
  {
    id: 12,
    name: "Medical Certificate",
    description: "Health clearance certificate",
    status: "not-started",
    required: true,
    uploadDate: null,
  },
];

export const defaultRoadmap: RoadmapMilestone[] = [
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

export const defaultActivities: ActivityItem[] = [
  {
    id: "seed-1",
    action: "Shortlisted MIT",
    type: "university",
    path: "/universities",
    createdAt: "2026-04-28T10:15:00.000Z",
  },
  {
    id: "seed-2",
    action: "Compared United States and United Kingdom",
    type: "comparison",
    path: "/compare-countries",
    createdAt: "2026-04-27T08:30:00.000Z",
  },
  {
    id: "seed-3",
    action: "Marked Academic Transcripts as completed",
    type: "document",
    path: "/documents",
    createdAt: "2026-04-26T14:45:00.000Z",
  },
  {
    id: "seed-4",
    action: "Updated profile preferences",
    type: "profile",
    path: "/profile",
    createdAt: "2026-04-25T17:20:00.000Z",
  },
];

export const countryData = {
  "United States": {
    countryCode: "US",
    image:
      "https://images.unsplash.com/photo-1772546392507-5ab8236031a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2ElMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc2Njc2NzU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
    countryCode: "UK",
    image:
      "https://images.unsplash.com/20/cambridge.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1ayUyMG94Zm9yZCUyMGNhbWJyaWRnZSUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzc2Njc2NzU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tuitionRange: "GBP 15,000 - 35,000",
    livingCost: "GBP 12,000 - 15,000",
    studyDuration: "1 year (Master's)",
    topUniversities: ["Oxford", "Cambridge", "Imperial", "LSE"],
    workOpportunities: "Good (Graduate Visa)",
    languageRequirement: "IELTS 6.5+ / TOEFL 90+",
    applicationDeadline: "Sep - Jan",
    visaProcessing: "3-4 weeks",
    postStudyWork: "2 years",
  },
  Canada: {
    countryCode: "CA",
    image:
      "https://images.unsplash.com/photo-1618255630366-f402c45736f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5hZGElMjB0b3JvbnRvJTIwdW5pdmVyc2l0eSUyMGNhbXB1c3xlbnwxfHx8fDE3NzY2NzY3NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tuitionRange: "CAD 15,000 - 35,000",
    livingCost: "CAD 10,000 - 15,000",
    studyDuration: "2 years (Master's)",
    topUniversities: ["Toronto", "UBC", "McGill", "Waterloo"],
    workOpportunities: "Excellent (PGWP, PR pathway)",
    languageRequirement: "IELTS 6.5+ / TOEFL 90+",
    applicationDeadline: "Jan - Mar",
    visaProcessing: "4-6 weeks",
    postStudyWork: "3 years",
  },
  Australia: {
    countryCode: "AU",
    image:
      "https://images.unsplash.com/photo-1693872398294-93f419e6475a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXN0cmFsaWElMjBzeWRuZXklMjB1bml2ZXJzaXR5JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc2Njc2NzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tuitionRange: "AUD 20,000 - 45,000",
    livingCost: "AUD 20,000 - 25,000",
    studyDuration: "2 years (Master's)",
    topUniversities: ["Melbourne", "Sydney", "ANU", "UNSW"],
    workOpportunities: "Good (TSS, Skilled migration)",
    languageRequirement: "IELTS 6.5+ / TOEFL 79+",
    applicationDeadline: "Feb - Jul",
    visaProcessing: "4-6 weeks",
    postStudyWork: "2-4 years",
  },
  Germany: {
    countryCode: "DE",
    image:
      "https://images.unsplash.com/photo-1494904363624-286aa59fa5c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZXJtYW55JTIwbXVuaWNoJTIwdW5pdmVyc2l0eSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzY2NzY3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tuitionRange: "EUR 0 - 20,000",
    livingCost: "EUR 10,000 - 12,000",
    studyDuration: "2 years (Master's)",
    topUniversities: ["TUM", "LMU Munich", "Heidelberg", "RWTH Aachen"],
    workOpportunities: "Good (18 months job seeker visa)",
    languageRequirement: "IELTS 6.0+ or German B2",
    applicationDeadline: "May - Jul (Winter), Dec (Summer)",
    visaProcessing: "6-8 weeks",
    postStudyWork: "18 months",
  },
  Japan: {
    countryCode: "JP",
    image:
      "https://images.unsplash.com/photo-1627892541952-ba3e1604a44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbiUyMHRva3lvJTIwdW5pdmVyc2l0eSUyMGNhbXB1c3xlbnwxfHx8fDE3NzY2NzY3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tuitionRange: "JPY 500,000 - 1,500,000",
    livingCost: "JPY 1,000,000 - 1,500,000",
    studyDuration: "2 years (Master's)",
    topUniversities: ["Tokyo", "Kyoto", "Osaka", "Tohoku"],
    workOpportunities: "Good (Engineer visa)",
    languageRequirement: "JLPT N2 or IELTS 6.0+",
    applicationDeadline: "Sep - Nov",
    visaProcessing: "2-3 months",
    postStudyWork: "1 year (extendable)",
  },
  Singapore: {
    countryCode: "SG",
    image:
      "https://images.unsplash.com/photo-1759823420520-546e46818322?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjB1bml2ZXJzaXR5JTIwbW9kZXJuJTIwY2FtcHVzfGVufDF8fHx8MTc3NjY3Njc1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tuitionRange: "SGD 30,000 - 50,000",
    livingCost: "SGD 12,000 - 18,000",
    studyDuration: "1-2 years (Master's)",
    topUniversities: ["NUS", "NTU", "SMU"],
    workOpportunities: "Excellent (Employment Pass)",
    languageRequirement: "IELTS 6.5+ / TOEFL 85+",
    applicationDeadline: "Nov - Feb",
    visaProcessing: "2-4 weeks",
    postStudyWork: "1 year",
  },
  Netherlands: {
    countryCode: "NL",
    image:
      "https://images.unsplash.com/photo-1664054135532-df441aed0af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXRoZXJsYW5kcyUyMGFtc3RlcmRhbSUyMHVuaXZlcnNpdHklMjBidWlsZGluZ3xlbnwxfHx8fDE3NzY2NzY3NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tuitionRange: "EUR 8,000 - 20,000",
    livingCost: "EUR 10,000 - 13,000",
    studyDuration: "1-2 years (Master's)",
    topUniversities: ["Delft", "Amsterdam", "Leiden", "Utrecht"],
    workOpportunities: "Good (Orientation year)",
    languageRequirement: "IELTS 6.5+ / TOEFL 90+",
    applicationDeadline: "Dec - May",
    visaProcessing: "2-4 weeks",
    postStudyWork: "1 year",
  },
} as const;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStorageValue<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function usePersistentState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(() => readStorageValue(key, fallback));

  useEffect(() => {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

export function appendActivity(
  item: Omit<ActivityItem, "id" | "createdAt"> & { createdAt?: string },
) {
  if (!canUseStorage()) {
    return;
  }

  const existing = readStorageValue<ActivityItem[]>(STORAGE_KEYS.activities, defaultActivities);
  const nextItem: ActivityItem = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: item.createdAt ?? new Date().toISOString(),
    action: item.action,
    type: item.type,
    path: item.path,
  };

  window.localStorage.setItem(
    STORAGE_KEYS.activities,
    JSON.stringify([nextItem, ...existing].slice(0, 12)),
  );
}

export function formatRelativeTime(dateString: string) {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return target.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDeadline(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getDocumentStatusLabel(status: DocumentStatus) {
  switch (status) {
    case "completed":
      return "Completed";
    case "pending":
      return "In Progress";
    default:
      return "Not Started";
  }
}

export function recomputeRoadmapStatus(milestones: RoadmapMilestone[]) {
  let activeMilestoneAssigned = false;

  return milestones.map((milestone) => {
    const completedTasks = milestone.tasks.filter((task) => task.completed).length;

    if (completedTasks === milestone.tasks.length) {
      return { ...milestone, status: "completed" as const };
    }

    if (completedTasks > 0 && !activeMilestoneAssigned) {
      activeMilestoneAssigned = true;
      return { ...milestone, status: "in-progress" as const };
    }

    if (!activeMilestoneAssigned) {
      activeMilestoneAssigned = true;
      return { ...milestone, status: "in-progress" as const };
    }

    return { ...milestone, status: "pending" as const };
  });
}
