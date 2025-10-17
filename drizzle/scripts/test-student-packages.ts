import { config } from "dotenv";
import { faker } from "@faker-js/faker";
import { db } from "../db";
import { student, schoolPackage, studentPackage } from "../schema";

config({ path: ".env.local" });

async function testStudentPackageRequests() {
    console.log("🧪 Testing student package request workflow...");

    try {
        // Get some students and packages
        const students = await db.select().from(student).limit(3);
        const packages = await db.select().from(schoolPackage).limit(4);

        console.log(`✅ Found ${students.length} students and ${packages.length} packages`);

        // Create some student package requests
        const requests = [];
        
        for (const studentRecord of students) {
            // Each student requests 1-2 packages
            const packagesToRequest = faker.helpers.arrayElements(packages, { min: 1, max: 2 });
            
            for (const packageRecord of packagesToRequest) {
                // Generate request dates (within next 30 days)
                const startDate = faker.date.future({ days: 30 });
                const endDate = new Date(startDate);
                endDate.setHours(startDate.getHours() + (packageRecord.durationMinutes / 60));

                const requestData = {
                    studentId: studentRecord.id,
                    packageId: packageRecord.id,
                    requestedDateStart: startDate.toISOString(),
                    requestedDateEnd: endDate.toISOString(),
                    status: "requested" as const
                };

                const [insertedRequest] = await db.insert(studentPackage).values(requestData).returning();
                requests.push(insertedRequest);

                console.log(`📝 ${studentRecord.name} requested package ${packageRecord.id} for ${startDate.toDateString()}`);
            }
        }

        console.log(`\n🎉 Created ${requests.length} student package requests!`);

        // Show status summary
        const statusCount = requests.reduce((acc, req) => {
            acc[req.status] = (acc[req.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log("\n📊 Request Status Summary:");
        Object.entries(statusCount).forEach(([status, count]) => {
            console.log(`   ${status.toUpperCase()}: ${count} requests`);
        });

    } catch (error) {
        console.error("❌ Error testing student packages:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

testStudentPackageRequests();