import ts from "rollup-plugin-ts";

export default {
  input: "src/index.ts",
  output: [
    {
      dir: "lib",
      format: "cjs",
      sourcemap: true,
    },
    {
      dir: "es",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [ts({})],
  external: ["child_process"],
};
