import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';
import css from "rollup-plugin-css-only";
import sveltePreprocess from "svelte-preprocess";
import dotenv from "dotenv";

dotenv.config();

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "npm",
        ["run", "start", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    replace({
      APP_ENV_FIREBASE_API_KEY: JSON.stringify(
        process.env.APP_ENV_FIREBASE_API_KEY
      ),
      APP_ENV_FIREBASE_AUTH_DOMAIN: JSON.stringify(
        process.env.APP_ENV_FIREBASE_AUTH_DOMAIN
      ),
      APP_ENV_FIREBASE_PROJECT_ID: JSON.stringify(
        process.env.APP_ENV_FIREBASE_PROJECT_ID
      ),
      APP_ENV_FIREBASE_STORAGE_BUCKET: JSON.stringify(
        process.env.APP_ENV_FIREBASE_STORAGE_BUCKET
      ),
      APP_ENV_FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(
        process.env.APP_ENV_FIREBASE_MESSAGING_SENDER_ID
      ),
      APP_ENV_FIREBASE_APP_ID: JSON.stringify(
        process.env.APP_ENV_FIREBASE_APP_ID
      ),
    }),
    svelte({
      compilerOptions: {
        dev: !production,
      },
      preprocess: sveltePreprocess({
        sourceMap: !production,
        postcss: {
          plugins: [require("tailwindcss")(), require("autoprefixer")()],
        },
      }),
    }),
    css({ output: "bundle.css" }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    !production && serve(),
    !production && livereload("public"),
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
