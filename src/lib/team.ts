/**
 * Greenprint · Team roster (SOE 508 · Group 3 · FUTO)
 * ---------------------------------------------------
 * Single source of truth for the group. Powers:
 *   • the seeded demo accounts + team leaderboard,
 *   • the in-app "Team" page,
 *   • the per-member defense documentation.
 *
 * Each active member owns one clearly-scoped part of the system (their `role`),
 * so everyone has something concrete to present. Demo accounts all share the
 * password below — see DEMO_PASSWORD.
 */

export const DEMO_PASSWORD = "greenprint";

export interface TeamMember {
  id: string; // slug
  name: string; // full name as on the class list
  display: string; // friendly display name
  regNumber: string;
  email: string;
  role: string; // the part they own & present
  seedXp: number;
  seedStreak: number;
  lead?: boolean;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "ozuzu-victor", name: "Ozuzu Victor Onyedikachi", display: "Victor Ozuzu", regNumber: "20211274152", email: "victor.ozuzu@greenprint.demo", role: "Team Lead & Project Overview", seedXp: 4300, seedStreak: 9, lead: true },
  { id: "nwakanma-dominion", name: "Nwakanma Dominion Chinonso", display: "Dominion Nwakanma", regNumber: "20211274242", email: "dominion.nwakanma@greenprint.demo", role: "Architecture & System Design", seedXp: 3950, seedStreak: 12 },
  { id: "okoye-victor", name: "Okoye Victor Ebubechukwu", display: "Victor Okoye", regNumber: "20211270552", email: "victor.okoye@greenprint.demo", role: "Analysis Engine — Complexity Metrics", seedXp: 3400, seedStreak: 5 },
  { id: "ezeh-chibuzor", name: "Ezeh Chibuzor Nwabueze", display: "Chibuzor Ezeh", regNumber: "20211272292", email: "chibuzor.ezeh@greenprint.demo", role: "Analysis Engine — Inefficiency Rules", seedXp: 3020, seedStreak: 4 },
  { id: "onyemauche-victor", name: "Onyemauche Ifeanyichukwu Victor", display: "Ifeanyichukwu Onyemauche", regNumber: "20211282432", email: "ifeanyichukwu.onyemauche@greenprint.demo", role: "Energy & CO₂ Estimation Model", seedXp: 2680, seedStreak: 6 },
  { id: "obi-michael", name: "Obi Michael Chimaobi", display: "Michael Obi", regNumber: "20211265722", email: "michael.obi@greenprint.demo", role: "EcoScore & Scoring System", seedXp: 2400, seedStreak: 3 },
  { id: "okafor-kosisochukwu", name: "Okafor Kosisochukwu JohnPaul", display: "Kosisochukwu Okafor", regNumber: "20211287502", email: "kosisochukwu.okafor@greenprint.demo", role: "Authentication & Security", seedXp: 2150, seedStreak: 2 },
  { id: "enyinnia-joseph", name: "Enyinnia Joseph Chidubem", display: "Joseph Enyinnia", regNumber: "20211263432", email: "joseph.enyinnia@greenprint.demo", role: "Database & Data Model", seedXp: 1890, seedStreak: 3 },
  { id: "chukwuemeka-chinalurum", name: "Chukwuemeka-ogu Chinalurum Michael", display: "Chinalurum Chukwuemeka-ogu", regNumber: "20211264302", email: "chinalurum.chukwuemeka@greenprint.demo", role: "AI Layer — Claude Integration & Caching", seedXp: 1620, seedStreak: 1 },
  { id: "ukwuoma-chiemerie", name: "Ukwuoma Chiemerie Gerald", display: "Chiemerie Ukwuoma", regNumber: "20211277622", email: "chiemerie.ukwuoma@greenprint.demo", role: "Code Workspace & Editor", seedXp: 1400, seedStreak: 2 },
  { id: "alajemba-paul", name: "Alajemba Paul Uzochukwu", display: "Paul Alajemba", regNumber: "20211261512", email: "paul.alajemba@greenprint.demo", role: "Dashboard & Data Visualization", seedXp: 1180, seedStreak: 1 },
  { id: "okereke-clement", name: "Okereke Clement Kalu", display: "Clement Okereke", regNumber: "20211290762", email: "clement.okereke@greenprint.demo", role: "Gamification — XP, Levels, Badges, Streaks", seedXp: 940, seedStreak: 4 },
  { id: "ikeh-pamela", name: "Ikeh-ezeji Pamela Chinaza", display: "Pamela Ikeh-ezeji", regNumber: "20211258792", email: "pamela.ikeh@greenprint.demo", role: "UI/UX & Design System", seedXp: 760, seedStreak: 2 },
  { id: "joseph-ayo", name: "Joseph Ayo Isaac", display: "Ayo Joseph", regNumber: "20211296902", email: "ayo.joseph@greenprint.demo", role: "Reports & Export (PDF / CSV)", seedXp: 520, seedStreak: 1 },
  { id: "nwali-izuchukwu", name: "Nwali Izuchukwu Hosea", display: "Izuchukwu Nwali", regNumber: "20211269652", email: "izuchukwu.nwali@greenprint.demo", role: "Landing, Green Features & Deployment", seedXp: 300, seedStreak: 1 },
];

export const COURSE = {
  code: "SOE 508",
  title: "Special Topics in Software Engineering",
  group: "Group 3",
  institution: "Federal University of Technology, Owerri (FUTO)",
  department: "Software Engineering",
} as const;
