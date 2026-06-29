import {
  IA_ASSESSMENTS_PATH,
  jsonError,
  proxyBffJson,
  readJsonPayload,
} from "../../../../_lib/bff";

export const runtime = "nodejs";

type RevisionPayload = {
  adjustmentRequest: string;
};

function isRevisionPayload(payload: unknown): payload is RevisionPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const data = payload as Record<string, unknown>;

  return typeof data.adjustmentRequest === "string";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await context.params;
  const payload = await readJsonPayload(request);

  if (!payload) {
    return jsonError("Payload JSON invalido.", 400);
  }

  if (!assessmentId) {
    return jsonError("Id da avaliacao nao informado.", 400);
  }

  if (!isRevisionPayload(payload) || !payload.adjustmentRequest.trim()) {
    return jsonError("Informe a instrucao de ajuste da avaliacao.", 400);
  }

  return proxyBffJson({
    body: payload,
    errorMessage: "Erro ao revisar avaliacao no BFF.",
    method: "POST",
    path: `${IA_ASSESSMENTS_PATH}/${assessmentId}/revisions`,
  });
}
