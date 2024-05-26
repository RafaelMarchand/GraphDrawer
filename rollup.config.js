import dts from "rollup-plugin-dts"

export default {
  input: "./src/main.ts", // Entry point of the generated type declarations
  output: {
    file: "./dist/index.d.ts", // Output file
    format: "es"
  },
  plugins: [dts()]
}
