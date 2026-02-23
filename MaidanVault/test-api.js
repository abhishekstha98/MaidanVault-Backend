async function runTests() {
    try {
        console.log("--- Login to get Token ---");
        const loginRes = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "testuser1@maidanvault.com", password: "securepassword123" })
        });

        if (!loginRes.ok) {
            console.error("Login failed!", await loginRes.text());
            return;
        }
        const loginData = await loginRes.json();
        const token = loginData.data.accessToken;
        console.log("Got Token:", token.substring(0, 20) + "...");

        // 1. Create Team
        console.log("\n--- Testing POST /api/teams ---");
        const teamRes = await fetch("http://localhost:3000/api/teams", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Maidan Strikers " + Date.now(),
                logoUrl: "https://example.com/logo.png"
            })
        });
        console.log("Status:", teamRes.status);
        console.log("Body:", JSON.stringify(await teamRes.json(), null, 2));

        // 2. Fetch Teams List
        console.log("\n--- Testing GET /api/teams ---");
        const listRes = await fetch("http://localhost:3000/api/teams?limit=2");
        console.log("Status:", listRes.status);
        console.log("Body:", JSON.stringify(await listRes.json(), null, 2));

        // 3. Create Venue (Should Fail - User is PLAYER, not VENUE_OWNER)
        console.log("\n--- Testing POST /api/venues (RBAC Failure Expected) ---");
        const venueRes = await fetch("http://localhost:3000/api/venues", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Central Futsal Hub",
                location: "KTM",
                sportTypes: ["FUTSAL"]
            })
        });
        console.log("Status:", venueRes.status);
        console.log("Body:", JSON.stringify(await venueRes.json(), null, 2));

    } catch (err) {
        console.error("Test error:", err);
    }
}

runTests();
