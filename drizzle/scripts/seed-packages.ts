import { config } from "dotenv";
import { faker } from "@faker-js/faker";
import { db } from "../db";
import { school, schoolPackage } from "../schema";
import { EQUIPMENT_CATEGORIES, type EquipmentCategory } from "../../config/categories";

config({ path: ".env.local" });

const equipmentCategories = EQUIPMENT_CATEGORIES.map(cat => cat.id);

const packageTemplates = {
    kite: [
        { name: "Beginner Kite Lesson", duration: 120, description: "Introduction to kitesurfing basics and safety", price: 75 },
        { name: "Intermediate Kite Session", duration: 180, description: "Advanced techniques and wave riding", price: 95 },
        { name: "Kite Equipment Rental", duration: 240, description: "Full day kite equipment rental with supervision", price: 60 }
    ],
    wing: [
        { name: "Wing Foil Basics", duration: 90, description: "Learn the fundamentals of wing foiling", price: 85 },
        { name: "Advanced Wing Techniques", duration: 150, description: "Master advanced wing foiling maneuvers", price: 110 },
        { name: "Wing Equipment Package", duration: 180, description: "Wing and foil equipment rental", price: 70 }
    ],
    windsurf: [
        { name: "Windsurf Introduction", duration: 120, description: "Basic windsurf techniques for beginners", price: 65 },
        { name: "Windsurf Racing Prep", duration: 180, description: "Competitive windsurf training session", price: 90 },
        { name: "Windsurf Board Rental", duration: 240, description: "Full day windsurf board and sail rental", price: 45 }
    ],
    surf: [
        { name: "Surf Lesson Basics", duration: 90, description: "Learn to catch your first waves", price: 55 },
        { name: "Surf Technique Improvement", duration: 120, description: "Improve your surfing technique", price: 75 },
        { name: "Surf Board Rental", duration: 180, description: "Surfboard rental for experienced surfers", price: 35 }
    ],
    snowboard: [
        { name: "Snowboard Basics", duration: 180, description: "Learn snowboarding fundamentals", price: 80 },
        { name: "Snowboard Park Session", duration: 120, description: "Practice in the terrain park", price: 70 },
        { name: "Snowboard Equipment Rental", duration: 240, description: "Full day snowboard equipment rental", price: 50 }
    ]
};

function generatePackageForSchool(schoolId: string, category: EquipmentCategory) {
    const templates = packageTemplates[category];
    const template = faker.helpers.arrayElement(templates);
    
    return {
        schoolId,
        durationMinutes: template.duration,
        description: template.description,
        pricePerStudent: template.price + faker.number.int({ min: -10, max: 20 }), // Add some price variation
        capacityStudents: faker.number.int({ min: 4, max: 12 }), // 4-12 students per session
        capacityEquipment: faker.number.int({ min: 6, max: 15 }), // Equipment capacity
        categoryEquipment: category,
        isPublic: faker.datatype.boolean(0.8), // 80% chance of being public
        active: true
    };
}

async function seedPackages() {
    console.log("🏄 Seeding school packages...");

    try {
        // Get all schools
        const schools = await db.select().from(school);
        console.log(`✅ Found ${schools.length} schools to create packages for`);

        const insertedPackages = [];

        for (const schoolRecord of schools) {
            console.log(`\n🏫 Creating packages for ${schoolRecord.name}:`);
            
            // Create 2-4 packages per school with different categories
            const packageCount = faker.number.int({ min: 2, max: 4 });
            const selectedCategories = faker.helpers.arrayElements(equipmentCategories, packageCount);
            
            for (const category of selectedCategories) {
                const packageData = generatePackageForSchool(schoolRecord.id, category);
                
                const [insertedPackage] = await db.insert(schoolPackage).values(packageData).returning();
                insertedPackages.push(insertedPackage);
                
                console.log(`  ✅ ${category.toUpperCase()}: ${packageData.description} - $${packageData.pricePerStudent} (${packageData.durationMinutes}min)`);
            }
        }

        console.log(`\n🎉 Successfully created ${insertedPackages.length} packages!`);
        
        // Display summary by category
        const categoryCount = insertedPackages.reduce((acc, pkg) => {
            acc[pkg.categoryEquipment] = (acc[pkg.categoryEquipment] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        console.log("\n📊 Package Summary by Category:");
        Object.entries(categoryCount).forEach(([category, count]) => {
            console.log(`   ${category.toUpperCase()}: ${count} packages`);
        });

    } catch (error) {
        console.error("❌ Error seeding packages:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seedPackages();