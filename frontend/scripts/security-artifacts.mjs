export function extractSupabaseEndpointProjectIds(text) {
  return new Set(
    [...text.matchAll(
      /(?:https|wss):(?:\\?\/){2}([a-z0-9]{20})\.supabase\.co/g,
    )].map((match) => match[1]),
  );
}
