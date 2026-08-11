import assert from "node:assert/strict";
import test from "node:test";

import { extractSupabaseEndpointProjectIds } from "./security-artifacts.mjs";

test("extracts unique HTTPS and WSS Supabase endpoint project refs", () => {
  assert.deepEqual(
    [...extractSupabaseEndpointProjectIds(
      "https://aaaaaaaaaaaaaaaaaaaa.supabase.co " +
        "wss://aaaaaaaaaaaaaaaaaaaa.supabase.co " +
        "https://bbbbbbbbbbbbbbbbbbbb.supabase.co/functions/v1/bright-api",
    )],
    ["aaaaaaaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbbbbbbb"],
  );
});

test("extracts endpoint refs from escaped bundled URL strings", () => {
  assert.deepEqual(
    [...extractSupabaseEndpointProjectIds(
      String.raw`https:\/\/cccccccccccccccccccc.supabase.co`,
    )],
    ["cccccccccccccccccccc"],
  );
});
