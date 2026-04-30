import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const universities = [
    { name: "MIT", country: "USA", city: "Cambridge", ranking: 1, tuitionUSD: 57986, acceptanceRate: 4.7 },
    { name: "Stanford University", country: "USA", city: "Stanford", ranking: 2, tuitionUSD: 56169, acceptanceRate: 4.3 },
    { name: "Harvard University", country: "USA", city: "Cambridge", ranking: 3, tuitionUSD: 54768, acceptanceRate: 3.4 },
    { name: "University of California Berkeley", country: "USA", city: "Berkeley", ranking: 4, tuitionUSD: 44066, acceptanceRate: 14.5 },
    { name: "Carnegie Mellon University", country: "USA", city: "Pittsburgh", ranking: 5, tuitionUSD: 58924, acceptanceRate: 15.4 },
    { name: "University of Michigan", country: "USA", city: "Ann Arbor", ranking: 6, tuitionUSD: 52280, acceptanceRate: 20.1 },
    { name: "Cornell University", country: "USA", city: "Ithaca", ranking: 7, tuitionUSD: 59316, acceptanceRate: 10.6 },
    { name: "University of Texas Austin", country: "USA", city: "Austin", ranking: 8, tuitionUSD: 40032, acceptanceRate: 31.8 },
    { name: "University of Washington", country: "USA", city: "Seattle", ranking: 9, tuitionUSD: 39906, acceptanceRate: 48.5 },
    { name: "Purdue University", country: "USA", city: "West Lafayette", ranking: 10, tuitionUSD: 28794, acceptanceRate: 60.2 },
    { name: "University of Toronto", country: "Canada", city: "Toronto", ranking: 11, tuitionUSD: 35000, acceptanceRate: 43.0 },
    { name: "University of British Columbia", country: "Canada", city: "Vancouver", ranking: 12, tuitionUSD: 32000, acceptanceRate: 46.0 },
    { name: "McGill University", country: "Canada", city: "Montreal", ranking: 13, tuitionUSD: 28000, acceptanceRate: 46.3 },
    { name: "University of Waterloo", country: "Canada", city: "Waterloo", ranking: 14, tuitionUSD: 30000, acceptanceRate: 53.0 },
    { name: "University of Alberta", country: "Canada", city: "Edmonton", ranking: 15, tuitionUSD: 25000, acceptanceRate: 58.0 },
    { name: "University of Oxford", country: "UK", city: "Oxford", ranking: 16, tuitionUSD: 35000, acceptanceRate: 17.5 },
    { name: "University of Cambridge", country: "UK", city: "Cambridge", ranking: 17, tuitionUSD: 33000, acceptanceRate: 21.0 },
    { name: "Imperial College London", country: "UK", city: "London", ranking: 18, tuitionUSD: 38000, acceptanceRate: 14.3 },
    { name: "University College London", country: "UK", city: "London", ranking: 19, tuitionUSD: 32000, acceptanceRate: 63.0 },
    { name: "University of Edinburgh", country: "UK", city: "Edinburgh", ranking: 20, tuitionUSD: 28000, acceptanceRate: 43.0 },
    { name: "University of Melbourne", country: "Australia", city: "Melbourne", ranking: 21, tuitionUSD: 33000, acceptanceRate: 70.0 },
    { name: "Australian National University", country: "Australia", city: "Canberra", ranking: 22, tuitionUSD: 31000, acceptanceRate: 35.0 },
    { name: "University of Sydney", country: "Australia", city: "Sydney", ranking: 23, tuitionUSD: 34000, acceptanceRate: 30.0 },
    { name: "University of Queensland", country: "Australia", city: "Brisbane", ranking: 24, tuitionUSD: 29000, acceptanceRate: 40.0 },
    { name: "TU Munich", country: "Germany", city: "Munich", ranking: 25, tuitionUSD: 1500, acceptanceRate: 8.0 },
    { name: "LMU Munich", country: "Germany", city: "Munich", ranking: 26, tuitionUSD: 1000, acceptanceRate: 30.0 },
    { name: "Heidelberg University", country: "Germany", city: "Heidelberg", ranking: 27, tuitionUSD: 1500, acceptanceRate: 40.0 },
    { name: "NUS Singapore", country: "Singapore", city: "Singapore", ranking: 28, tuitionUSD: 25000, acceptanceRate: 5.0 },
    { name: "NTU Singapore", country: "Singapore", city: "Singapore", ranking: 29, tuitionUSD: 24000, acceptanceRate: 7.0 },
    { name: "University of Amsterdam", country: "Netherlands", city: "Amsterdam", ranking: 30, tuitionUSD: 15000, acceptanceRate: 25.0 },
  ];

  for (const uni of universities) {
    await prisma.university.upsert({
      where: { id: uni.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: uni.name.toLowerCase().replace(/\s+/g, "-"),
        ...uni,
      },
    });
  }

  console.log("✅ Universities seeded successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());