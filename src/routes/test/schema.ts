import { JoiXss } from "@/utils/utils.js";

export const testSchema = JoiXss.object({
    name: JoiXss.string().required().xss(), // xss() is a custom extension method that will make sure the string is safe from XSS attacks
    email: JoiXss.string().email().required(),
});
