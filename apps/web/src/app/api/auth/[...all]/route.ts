import { authEcommerce } from "@emach/auth/ecommerce";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(authEcommerce);
