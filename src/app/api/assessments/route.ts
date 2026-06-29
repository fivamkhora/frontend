import {
  IA_ASSESSMENTS_PATH,
  jsonError,
  proxyBffJson,
  readJsonPayload,
} from "../_lib/bff";

export const runtime = "nodejs";

type AssessmentPayload = {
  subject: string;
  gradeLevel: string;
  classroomMaterial: string;
  assessmentType: string;
  questionCount: number;
  difficulty: string;
  teacherInstructions: string;
};

function isAssessmentPayload(payload: unknown): payload is AssessmentPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const data = payload as Record<string, unknown>;

  return (
    typeof data.subject === "string" &&
    typeof data.gradeLevel === "string" &&
    typeof data.classroomMaterial === "string" &&
    typeof data.assessmentType === "string" &&
    typeof data.questionCount === "number" &&
    typeof data.difficulty === "string" &&
    typeof data.teacherInstructions === "string"
  );
}

export async function GET(request: Request) {
  const { search } = new URL(request.url);

  return proxyBffJson({
    errorMessage: "Erro ao listar avaliacoes no BFF.",
    method: "GET",
    path: `${IA_ASSESSMENTS_PATH}${search}`,
  });
}

export async function POST(request: Request) {
  const payload = await readJsonPayload(request);

  if (!payload) {
    return jsonError("Payload JSON invalido.", 400);
  }

  if (!isAssessmentPayload(payload)) {
    return jsonError("Payload da avaliacao invalido.", 400);
  }

  if (
    !payload.subject.trim() ||
    !payload.gradeLevel.trim() ||
    !payload.classroomMaterial.trim() ||
    !payload.assessmentType.trim() ||
    !Number.isFinite(payload.questionCount) ||
    payload.questionCount < 1
  ) {
    return jsonError("Preencha os campos obrigatorios da avaliacao.", 400);
  }

  return proxyBffJson({
    body: payload,
    errorMessage: "Erro ao criar avaliacao no BFF.",
    method: "POST",
    path: IA_ASSESSMENTS_PATH,
  });
}
