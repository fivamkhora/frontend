import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import ts from "typescript";

function loadAuthModule() {
  const sourcePath = join(process.cwd(), "src", "services", "auth.ts");
  const source = readFileSync(sourcePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const module = { exports: {} };
  const context = {
    exports: module.exports,
    module,
    setTimeout,
  };

  vm.runInNewContext(output, context, { filename: sourcePath });

  return module.exports;
}

test("mockLogin returns a bearer token for valid credentials", async () => {
  const { mockLogin } = loadAuthModule();

  const response = await mockLogin("professor@khora.com", "senha123");

  assert.equal(response.token_type, "Bearer");
  assert.equal(response.access_token, "mock-jwt-token-ey123456789...");
  assert.equal(response.user.username, "professor@khora.com");
  assert.equal(response.user.role, "professor");
});

test("mockLogin rejects when password has fewer than 6 characters", async () => {
  const { mockLogin } = loadAuthModule();

  await assert.rejects(
    () => mockLogin("professor@khora.com", "12345"),
    (error) =>
      typeof error.detail === "string" && error.detail.includes("senha"),
  );
});
