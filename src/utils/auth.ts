import "dotenv/config";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import * as schema from "../models/index.js";
import db from "../services/database.js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "mysql",
        schema: schema
    }),

    trustedOrigins: process.env.BETTER_TRUSTED_ORIGINS?.split(",") || ["http://localhost:3000"],
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    emailAndPassword: {
        enabled: true,
    },

    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            redirectURI: process.env.BASE_URL + "/api/auth/callback/github/",
        }
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24 // 1 day (every 1 day the session expiration is updated)
    },
});