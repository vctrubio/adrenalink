import { config } from "dotenv";
import { faker } from "@faker-js/faker";
import { db } from "../db";
import { students } from "../schema";

config({ path: ".env.local" });

const SEED_COUNT = 2;

function generateStudentData() {
  return Array.from({ length: SEED_COUNT }, () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
  }));
}

async function seedStudents() {
  console.log(`🌱 Seeding ${SEED_COUNT} students...`);
  
  const studentsData = generateStudentData();
  
  try {
    for (const student of studentsData) {
      await db.insert(students).values(student);
      console.log(`✅ Added student: ${student.name} (${student.email})`);
    }
    
    console.log("🎉 Students seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding students:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedStudents();