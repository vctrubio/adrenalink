/**
 * Run all mock seeds in sequence
 * Usage: bun supabase/db/mock-all.ts
 */

console.log("mock-ass");

const run = async () => {
  await import("./mock-berkley.ts");
  await import("./mock-tarifa.ts");
  await import("./mock-lisboa.ts");
  await import("./mock-master.ts");
  console.log("✅ All mocks seeded!");
};

run();
