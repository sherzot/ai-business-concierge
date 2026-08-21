import { Ajv } from "npm:ajv@8.17.1";
import addFormatsModule from "npm:ajv-formats@3.0.1";
import schema from "./schemas/candidate-analysis.schema.json" with {
  type: "json",
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("candidate result schema accepts error envelopes and enforces result/error exclusivity", () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const addFormats = addFormatsModule as unknown as (instance: Ajv) => Ajv;
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const errorResult = {
    request_id: "01K36X8M3M0123456789ABCDEF",
    status: "error",
    duration_ms: 12,
    locale: "uz",
    error: {
      code: "INVALID_REQUEST",
      message_uz: "So'rov yaroqsiz.",
      message_ja: "リクエストが無効です。",
      message_en: "Invalid request.",
      field: "locale",
    },
  };

  assert(validate(errorResult), JSON.stringify(validate.errors));
  assert(
    !validate({ ...errorResult, result: {} }),
    "error result must not include a success payload",
  );
  assert(
    !validate({ ...errorResult, status: "ok", error: undefined }),
    "success result must include a payload",
  );
  assert(
    !validate({
      ...errorResult,
      error: { ...errorResult.error, code: "UNKNOWN_ERROR" },
    }),
    "unknown error code must be rejected",
  );
});
