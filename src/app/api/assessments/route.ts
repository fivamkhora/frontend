import { NextResponse } from "next/server";

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

const bffBaseUrl =
  process.env.BFF_BASE_URL?.replace(/\/$/, "") ??
  "https://bff-khora.onrender.com";
const assessmentsPath = "/api/v1/ia/assessments";

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

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

export function GET() {
  return NextResponse.json({
    status: "ok",
    route: "/api/v1/assessments",
    upstream: `${bffBaseUrl}${assessmentsPath}`,
  });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Payload JSON invalido." },
      { status: 400 },
    );
  }

  if (!isAssessmentPayload(payload)) {
    return NextResponse.json(
      { error: "Payload da avaliacao invalido." },
      { status: 400 },
    );
  }

  if (
    !payload.subject.trim() ||
    !payload.gradeLevel.trim() ||
    !payload.classroomMaterial.trim() ||
    !payload.assessmentType.trim() ||
    !Number.isFinite(payload.questionCount) ||
    payload.questionCount < 1
  ) {
    return NextResponse.json(
      { error: "Preencha os campos obrigatorios da avaliacao." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${bffBaseUrl}${assessmentsPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const responseText = await response.text();
    const data = parseJsonSafely(responseText);

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            response.status === 404
              ? "O BFF nao encontrou o endpoint de criacao de avaliacao."
              : "Erro ao criar avaliacao no BFF.",
          upstreamStatus: response.status,
          upstreamPath: assessmentsPath,
          upstreamResponse:
            data ?? responseText ?? "Resposta vazia retornada pelo BFF.",
        },
        { status: response.status === 404 ? 502 : response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel comunicar com o BFF." },
      { status: 502 },
    );
  }
}
