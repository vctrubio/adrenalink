import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL!);

const enableRealtime = async () => {
    try {
        console.log("🚀 Enabling Realtime for tables...\n");

        // Enable Realtime for booking table
        try {
            await client`ALTER PUBLICATION supabase_realtime ADD TABLE booking`;
            console.log("✅ Realtime enabled for booking table");
        } catch (err: any) {
            if (err.code === "42710") {
                console.log("ℹ️  booking table already in publication");
            } else {
                throw err;
            }
        }

        // Ensure booking table includes INSERT operations
        try {
            await client`ALTER PUBLICATION supabase_realtime SET (publish = 'insert,update,delete') FOR TABLE booking`;
            console.log("✅ Booking table configured to publish INSERT, UPDATE, DELETE");
        } catch (err: any) {
            console.warn("⚠️  Could not set publish operations for booking table:", err.message);
        }

        // Enable Realtime for event table with all operations
        try {
            await client`ALTER PUBLICATION supabase_realtime ADD TABLE event`;
            console.log("✅ Realtime enabled for event table");
        } catch (err: any) {
            if (err.code === "42710") {
                console.log("ℹ️  event table already in publication");
            } else {
                throw err;
            }
        }

        // Ensure event table includes DELETE operations
        try {
            await client`ALTER PUBLICATION supabase_realtime SET (publish = 'insert,update,delete') FOR TABLE event`;
            console.log("✅ Event table configured to publish INSERT, UPDATE, DELETE");
        } catch (err: any) {
            console.warn("⚠️  Could not set publish operations for event table:", err.message);
        }

        // Enable Realtime for lesson table
        try {
            await client`ALTER PUBLICATION supabase_realtime ADD TABLE lesson`;
            console.log("✅ Realtime enabled for lesson table");
        } catch (err: any) {
            if (err.code === "42710") {
                console.log("ℹ️  lesson table already in publication");
            } else {
                throw err;
            }
        }

        // Ensure lesson table includes DELETE operations
        try {
            await client`ALTER PUBLICATION supabase_realtime SET (publish = 'insert,update,delete') FOR TABLE lesson`;
            console.log("✅ Lesson table configured to publish INSERT, UPDATE, DELETE");
        } catch (err: any) {
            console.warn("⚠️  Could not set publish operations for lesson table:", err.message);
        }

        console.log("\n🎉 All tables configured for Realtime listening!");
    } catch (error) {
        console.error("❌ Error enabling Realtime:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
};

enableRealtime();
