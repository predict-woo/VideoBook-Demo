import { makeConfig } from "@remotion/eslint-config-flat";

const conf = makeConfig({
  remotionDir: ["remotion/**"],
});

export default [
  {
    ignores: [".react-router", "deploy.mjs"],
  },
  ...conf,
];
