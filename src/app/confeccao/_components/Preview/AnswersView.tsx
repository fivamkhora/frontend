import { NormalizedAnswer } from "../ConfeccaoProvasContent";

export default function AnswersView({
  answers,
}: {
  answers: NormalizedAnswer[];
}) {
  return (
    <div className="space-y-4">
      {answers.map((answer) => (
        <section
          key={answer.number}
          className="rounded-md border border-slate-200 bg-slate-50 p-4"
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-bold text-white">
              {answer.number}
            </span>
            <div className="text-sm font-bold text-slate-950">
              Resposta: {answer.answer}
            </div>
          </div>

          {answer.rubric && (
            <p className="text-sm leading-6 text-slate-700">
              <strong>Critério:</strong> {answer.rubric}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
