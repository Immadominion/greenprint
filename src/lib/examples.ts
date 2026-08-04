/**
 * Greenprint · Example snippets
 * -----------------------------
 * Curated code samples used for the "Try an example" buttons in the workspace and
 * to seed a realistic analysis history. A mix of wasteful and clean code so the
 * engine has something interesting to say.
 */
import type { Language } from "@/lib/analysis";

export interface CodeExample {
  id: string;
  label: string;
  language: Language;
  description: string;
  tone: "problem" | "clean";
  code: string;
}

export const EXAMPLES: CodeExample[] = [
  {
    id: "n-plus-one",
    label: "N+1 Database Query",
    language: "javascript",
    description: "A query hidden inside nested loops — the classic scaling killer.",
    tone: "problem",
    code: `async function loadOrderTotals(users, orders) {
  const totals = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < orders.length; j++) {
      if (orders[j].userId === users[i].id) {
        const rows = await db.query(
          "SELECT * FROM order_items WHERE order_id = " + orders[j].id
        );
        console.log("loaded", rows.length);
        totals.push({ user: users[i].id, count: rows.length });
      }
    }
  }
  return totals;
}`,
  },
  {
    id: "naive-fib",
    label: "Naive Recursive Fibonacci",
    language: "python",
    description: "Exponential recursion that recomputes the same values billions of times.",
    tone: "problem",
    code: `def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

def print_series(count):
    for i in range(count):
        print(fib(i))`,
  },
  {
    id: "string-builder",
    label: "String Building in a Loop",
    language: "java",
    description: "Immutable strings re-allocated every iteration — quadratic memory churn.",
    tone: "problem",
    code: `public class Report {
    public String build(String[] rows) {
        String out = "";
        for (int i = 0; i < rows.length; i++) {
            out = out + rows[i] + "\\n";
            System.out.println("appended row " + i);
        }
        return out;
    }
}`,
  },
  {
    id: "membership-scan",
    label: "Membership Test in a Loop",
    language: "python",
    description: "Repeated linear scans of a list where a set would be O(1).",
    tone: "problem",
    code: `def find_common(records, blacklist):
    flagged = []
    for r in records:
        if r["email"] in blacklist:
            flagged.append(r)
    return flagged`,
  },
  {
    id: "clean-lookup",
    label: "Optimized Map Lookup",
    language: "typescript",
    description: "The greener version: pre-index with a Map for O(1) joins.",
    tone: "clean",
    code: `export function joinOrders(users: User[], orders: Order[]) {
  const byUser = new Map<string, Order[]>();
  for (const order of orders) {
    const list = byUser.get(order.userId) ?? [];
    list.push(order);
    byUser.set(order.userId, list);
  }
  return users.map((user) => ({
    user: user.id,
    orders: byUser.get(user.id) ?? [],
  }));
}`,
  },
  {
    id: "clean-util",
    label: "Clean Utility Function",
    language: "typescript",
    description: "Small, single-purpose, well-commented — a healthy baseline.",
    tone: "clean",
    code: `/** Format bytes into a human-readable string. */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return value.toFixed(1) + " " + units[i];
}`,
  },
];

export function exampleById(id: string): CodeExample | undefined {
  return EXAMPLES.find((e) => e.id === id);
}
