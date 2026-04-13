import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linter.Config[]} */
export default [{ ignores: ["src/lib/convex/_generated/**"] }, ...nextJsConfig]
