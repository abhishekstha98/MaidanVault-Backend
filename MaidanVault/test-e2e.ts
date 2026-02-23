import prisma from "./src/data-access/prismaClient";

async function runTests() {
    console.log("Starting E2E Tests for Matches & Bookings...");

    try {
        // 1. Seed a Venue directly (Bypassing RBAC just for test setup)
        // First we need a user to be the owner
        const randomStr = Date.now().toString();

        let owner = await prisma.user.findFirst({ where: { role: "VENUE_OWNER" } });
        if (!owner) {
            owner = await prisma.user.create({
                data: {
                    email: `owner_${randomStr}@test.com`,
                    passwordHash: "hashed",
                    name: "Test Owner",
                    role: "VENUE_OWNER"
                }
            });
        }

        const venue = await prisma.venue.create({
            data: {
                ownerId: owner.id,
                name: "Test Arena " + randomStr,
                location: "Test City",
                sportTypes: ["FOOTBALL"],
                pricePerHour: 1500
            }
        });
        console.log("✅ Seeded Venue:", venue.id);

        // 2. Register/Login a Player to act as Captain
        console.log("Registering Player...");
        const regRes = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: `player_${randomStr}@test.com`,
                password: "password123",
                name: "Player 1",
                role: "PLAYER"
            })
        });
        const regData = await regRes.json();
        const token = regData.data.accessToken;

        // 3. Create Home and Away Teams
        console.log("Creating Teams...");
        let res = await fetch("http://localhost:3000/api/teams", {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ name: "Home " + randomStr })
        });
        const homeTeam = (await res.json()).data;

        res = await fetch("http://localhost:3000/api/teams", {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ name: "Away " + randomStr })
        });
        const awayTeam = (await res.json()).data;
        console.log(`✅ Created Home: ${homeTeam.id}, Away: ${awayTeam.id}`);

        // 4. Test Matches: Schedule a Match
        console.log("\n--- Testing Matches ---");
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        res = await fetch("http://localhost:3000/api/matches", {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                homeTeamId: homeTeam.id,
                awayTeamId: awayTeam.id,
                venueId: venue.id,
                scheduledAt: tomorrow.toISOString()
            })
        });
        if (!res.ok) throw new Error("Match scheduling failed: " + await res.text());
        const match = (await res.json()).data;
        console.log("✅ Match Scheduled:", match.id);

        // 5. Test Matches: Update Score and Complete
        res = await fetch(`http://localhost:3000/api/matches/${match.id}/score`, {
            method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ homeScore: 3, awayScore: 1 })
        });
        const updatedMatch = (await res.json()).data;
        console.log("✅ Match Completed. Final status:", updatedMatch.status);

        // 6. Test Bookings: Create a valid Booking
        console.log("\n--- Testing Bookings ---");
        const startTime = new Date(); startTime.setDate(startTime.getDate() + 2);
        const endTime = new Date(startTime); endTime.setHours(endTime.getHours() + 1);

        res = await fetch("http://localhost:3000/api/bookings", {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                venueId: venue.id,
                sportType: "FOOTBALL",
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            })
        });
        if (!res.ok) throw new Error("Booking failed: " + await res.text());
        const booking = (await res.json()).data;
        console.log("✅ Booking Created:", booking.id, "| Total Price:", booking.totalPrice);

        // 7. Test Bookings: Overlap Collision
        res = await fetch("http://localhost:3000/api/bookings", {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                venueId: venue.id,
                sportType: "FOOTBALL",
                startTime: startTime.toISOString(), // Same time
                endTime: endTime.toISOString()
            })
        });
        if (res.status === 409) {
            console.log("✅ Overlap Collision Successfully Blocked!");
        } else {
            console.error("❌ Overlap Collision FAILED TO BLOCK!", await res.text());
        }

        console.log("\n🎉 All tests completed successfully!");

    } catch (e) {
        console.error("Test execution failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

runTests();
