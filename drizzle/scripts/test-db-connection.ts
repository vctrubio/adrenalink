import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema";
import * as relations from "../relations";

// Load environment variables
config({ path: ".env.local" });

const fullSchema = { ...schema, ...relations };

async function testDatabaseConnection() {
    console.log("🔌 Testing database connection...");
    
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is not defined in .env.local");
        process.exit(1);
    }

    console.log("📍 Using DATABASE_URL:", process.env.DATABASE_URL.replace(/:([^:@]+)@/, ":****@"));

    try {
        // Create postgres client
        const client = postgres(process.env.DATABASE_URL);
        const db = drizzle(client, { schema: fullSchema });

        // Test basic connection
        console.log("🧪 Testing basic connection...");
        const result = await client`SELECT version()`;
        console.log("✅ Connected to PostgreSQL:", result[0].version);

        // Test Drizzle ORM connection
        console.log("🧪 Testing Drizzle ORM...");
        const schoolsCount = await db.select().from(schema.school);
        console.log(`✅ Drizzle query successful: Found ${schoolsCount.length} schools`);

        // Test relations
        console.log("🧪 Testing relations...");
        const studentsCount = await db.select().from(schema.student);
        console.log(`✅ Relations working: Found ${studentsCount.length} students`);

        // Close connection
        await client.end();
        console.log("🎉 Database connection test completed successfully!");
        
    } catch (error) {
        console.error("❌ Database connection failed:");
        
        if (error instanceof Error) {
            if (error.message.includes("ENOTFOUND")) {
                console.error("🔍 DNS Resolution Error - This means:");
                console.error("   • You're using a direct connection (db.*.supabase.co) instead of pooled");
                console.error("   • Switch to pooled connection: aws-X-region.pooler.supabase.com:6543");
                console.error("   • Update your DATABASE_URL in .env.local");
            } else if (error.message.includes("password authentication failed")) {
                console.error("🔐 Authentication Error - Check your password in DATABASE_URL");
            } else if (error.message.includes("does not exist")) {
                console.error("🗄️  Database/Table Error - Run migrations: npm run db:push");
            } else {
                console.error("💥 Unexpected error:", error.message);
            }
        }
        
        process.exit(1);
    }
}

// Run the test
testDatabaseConnection();