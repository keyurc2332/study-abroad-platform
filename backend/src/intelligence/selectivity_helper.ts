// selectivity_helper.ts
// Replaces raw acceptanceRate with human-readable selectivityLevel
// This avoids showing fabricated/unreliable grad CS acceptance rates

export function getSelectivityLevel(competitivenessScore: number | null): {
  level: string;
  label: string;
} {
  const cs = competitivenessScore ?? 5;
  if (cs >= 9)  return { level: "Extremely Competitive", label: "Top 1–5% of applicants admitted" };
  if (cs >= 8)  return { level: "Highly Competitive",   label: "Top 5–15% of applicants admitted" };
  if (cs >= 7)  return { level: "Very Competitive",     label: "Top 15–25% of applicants admitted" };
  if (cs >= 6)  return { level: "Competitive",          label: "Selective — strong profile needed" };
  if (cs >= 4)  return { level: "Moderately Selective", label: "Good profile sufficient" };
  if (cs >= 2)  return { level: "Accessible",           label: "Most qualified applicants admitted" };
  return        { level: "Open Enrollment",             label: "Low barriers to admission" };
}