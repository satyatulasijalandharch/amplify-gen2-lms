import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        BASE_URL: z.string().url(),
        STRIPE_SECRET_KEY: z.string().min(1),
        STRIPE_WEBHOOK_SECRET: z.string().min(1),
    },
    // For Next.js >= 13.4.4, you only need to destructure client variables:
    experimental__runtimeEnv: {

    }
});