import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import ts from "typescript";

function loadAuthModule(fetchMock) {
  const sourcePath = join(process.cwd(), "src", "services", "auth.ts");
  const source = readFileSync(sourcePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const testModule = { exports: {} };
  const context = {
    exports: testModule.exports,
    fetch: fetchMock,
    module: testModule,
  };

  vm.runInNewContext(output, context, { filename: sourcePath });

  return testModule.exports;
}

test("login posts credentials to the internal auth route", async () => {
  const fetchCalls = [];
  const { login } = loadAuthModule(async (...args) => {
    fetchCalls.push(args);

    return {
      json: async () => ({
        role: "Professor",
        token: "jwt-token",
      }),
      ok: true,
    };
  });

  const response = await login("joao.professor", "senha123");

  assert.deepEqual(response, {
    role: "Professor",
    token: "jwt-token",
  });
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0][0], "/api/auth/signin");
  assert.equal(fetchCalls[0][1].method, "POST");
  assert.equal(
    fetchCalls[0][1].body,
    JSON.stringify({ username: "joao.professor", password: "senha123" }),
  );
});

test("login rejects with the BFF error message", async () => {
  const { login } = loadAuthModule(async () => ({
    json: async () => ({
      upstreamResponse: {
        detail: "Credenciais invalidas.",
      },
    }),
    ok: false,
  }));

  await assert.rejects(
    () => login("joao.professor", "senha-errada"),
    /Credenciais invalidas/,
  );
});
