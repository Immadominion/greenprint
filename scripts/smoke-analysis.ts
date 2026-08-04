/* Dev smoke test for the analysis engine. Run: npm run smoke */
import { analyzeCode } from "../src/lib/analysis";

const cases: { name: string; language?: any; code: string }[] = [
  {
    name: "JS — nested loops + N+1 query + SELECT *",
    language: "javascript",
    code: `async function findMatches(users, orders) {
  const result = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < orders.length; j++) {
      if (users[i].id === orders[j].userId) {
        const detail = await db.query("SELECT * FROM details WHERE id = " + orders[j].id);
        console.log(detail);
        result.push(detail);
      }
    }
  }
  return result;
}`,
  },
  {
    name: "Python — naive recursive Fibonacci",
    language: "python",
    code: `def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

# membership test in a loop
def contains(data, items):
    for x in data:
        if x in items:
            print(x)`,
  },
  {
    name: "TS — clean, small function",
    language: "typescript",
    code: `export function add(a: number, b: number): number {
  // adds two numbers
  return a + b;
}`,
  },
];

for (const c of cases) {
  const r = analyzeCode({ code: c.code, language: c.language });
  console.log("\n=== " + c.name + " ===");
  console.log("language        :", r.language);
  console.log("ecoScore        :", r.ecoScore.score, r.ecoScore.grade, `(${r.ecoScore.rating})`);
  console.log("qualityScore    :", r.qualityScore);
  console.log("complexityClass :", r.energy.complexityClass, `(${r.energy.complexityLabel})`);
  console.log("est. runtime ms :", r.energy.estimatedRuntimeMs, "| CO2 g:", r.energy.estimatedCo2Grams, "| savable g:", r.energy.potentialCo2SavingGrams);
  console.log("cyclomatic/nest :", r.complexity.cyclomatic, "/", r.complexity.maxNestingDepth, "loops:", r.complexity.maxLoopNesting);
  console.log("severity counts :", JSON.stringify(r.issueCountBySeverity));
  console.log("issues          :", r.issues.map((i) => `${i.id}@L${i.line}[${i.severity}]`).join(", ") || "none");
  console.log("analysis took   :", r.analysisDurationMs, "ms  | hash:", r.hash);
}
