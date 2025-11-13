import { config } from "dotenv";
import { db } from "../db";
import { student, school, schoolStudents, schoolPackage, studentPackage } from "../schema";
import { writeFileSync } from "fs";
import { join } from "path";

config({ path: ".env.local" });

async function extractSeededData() {
    console.log("📊 Extracting seeded data from database...");

    try {
        // Get all students
        const students = await db.select().from(student);
        console.log(`✅ Found ${students.length} students`);

        // Get all schools
        const schools = await db.select().from(school);
        console.log(`✅ Found ${schools.length} schools`);

        // Show school usernames
        schools.forEach(s => {
            console.log(`   📍 School: ${s.name} (username: ${s.username})`);
        });

        // Get all school-student relationships
        const relationships = await db.select().from(schoolStudents);
        console.log(`✅ Found ${relationships.length} school-student relationships`);

        // Get all school packages
        const packages = await db.select().from(schoolPackage);
        console.log(`✅ Found ${packages.length} school packages`);

        // Get all student package requests
        const packageRequests = await db.select().from(studentPackage);
        console.log(`✅ Found ${packageRequests.length} student package requests`);

        // Create the mock data structure
        const mockData = {
            students,
            schools,
            schoolStudents: relationships,
            schoolPackages: packages,
            studentPackages: packageRequests
        };

        // Create the TypeScript file content
        const fileContent = `// Generated mock data from seeded database
// Generated on: ${new Date().toISOString()}

export const mockData = ${JSON.stringify(mockData, null, 4)};

export const mockStudents = mockData.students;
export const mockSchools = mockData.schools;
export const mockSchoolStudents = mockData.schoolStudents;
export const mockSchoolPackages = mockData.schoolPackages;
export const mockStudentPackages = mockData.studentPackages;
`;

        // Create the mocks directory if it doesn't exist
        const mocksDir = join(process.cwd(), "drizzle", "mocks");
        
        // Write the file
        const filePath = join(mocksDir, "v1.ts");
        writeFileSync(filePath, fileContent);

        console.log(`✅ Mock data written to: ${filePath}`);
        console.log("🎉 Data extraction completed successfully!");

        // Display summary
        console.log("\n📋 Summary:");
        console.log(`   Students: ${students.length}`);
        console.log(`   Schools: ${schools.length}`);
        console.log(`   Relationships: ${relationships.length}`);
        console.log(`   School Packages: ${packages.length}`);
        console.log(`   Student Package Requests: ${packageRequests.length}`);

    } catch (error) {
        console.error("❌ Error extracting data:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

extractSeededData();