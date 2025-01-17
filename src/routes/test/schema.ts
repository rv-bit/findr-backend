import { JoiXss } from "@/utils/utils.js";

export const testSchema = JoiXss.object({
    name: JoiXss.string().required().xss(), // Sanitize the input to prevent XSS attacks
    email: JoiXss.string().email().required(),
});
