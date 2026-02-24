import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";

const registry = new OpenAPIRegistry();

// Register BearerAuth
registry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "JWT Access Token. Note: the Refresh Token is handled automatically via HTTP-only cookies in /api/auth endpoints."
});

// Import all schemas
import { registerSchema, loginSchema, refreshSchema } from "../validators/auth.validator";
import { createTeamSchema } from "../validators/team.validator";
import { createVenueSchema } from "../validators/venue.validator";
import { createBookingSchema } from "../validators/booking.validator";
import { createMatchSchema, updateMatchScoreSchema } from "../validators/match.validator";
import { createMatchRequestSchema, updateMatchRequestStatusSchema } from "../validators/match-request.validator";
import { createChallengeSchema, updateChallengeStatusSchema } from "../validators/challenge.validator";
import { createTournamentSchema, registerTournamentSchema } from "../validators/tournament.validator";

// Central Registration of Components to keep Router YAML concise
registry.register("RegisterInput", registerSchema);
registry.register("LoginInput", loginSchema);
registry.register("RefreshInput", refreshSchema);
registry.register("CreateTeamInput", createTeamSchema);
registry.register("CreateVenueInput", createVenueSchema);
registry.register("CreateBookingInput", createBookingSchema);
registry.register("CreateMatchInput", createMatchSchema);
registry.register("UpdateMatchScoreInput", updateMatchScoreSchema);
registry.register("CreateMatchRequestInput", createMatchRequestSchema);
registry.register("UpdateMatchRequestStatusInput", updateMatchRequestStatusSchema);
registry.register("CreateChallengeInput", createChallengeSchema);
registry.register("UpdateChallengeStatusInput", updateChallengeStatusSchema);
registry.register("CreateTournamentInput", createTournamentSchema);
registry.register("RegisterTournamentInput", registerTournamentSchema);

// Generate Document structures to feed into swaggerJsDoc
const generator = new OpenApiGeneratorV3(registry.definitions);
const zodDocument = generator.generateDocument({
    openapi: "3.0.0",
    info: { version: "1.0.0", title: "MaidanVault" },
});

// Setup swaggerJsDoc mixing the Zod components with JSDoc parsed routes
const options: swaggerJsDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MaidanVault API",
            version: "1.0.0",
            description: "Advanced API documentation mapped centrally from Zod Validators avoiding raw YAML redundancy."
        },
        servers: [
            { url: "/api", description: "Local API Route" }
        ],
        components: zodDocument.components
    },
    apis: ["./src/routes/*.ts"], // Path to the API docs
};

const swaggerSpec = swaggerJsDoc(options);

export const setupSwagger = (app: Application) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
