import { NormalizedQuestion } from "../ConfeccaoProvasContent";

export default function QuestionsView({
  questions,
}: {
  questions: NormalizedQuestion[];
}) {
  return (
    <div className="space-y-5">
      {questions.map((question) => (
        <section
          key={question.number}
          className="rounded-md border border-slate-200 bg-white p-4"
        >
          <div className="mb-4 grid grid-cols-[44px_1fr] gap-3">
            <div className="font-bold text-[#1e3a8a]">{question.number}.</div>
            <div>
              <div className="text-sm font-medium leading-6 text-slate-900">
                {question.statement}
              </div>
              {(question.type || question.points) && (
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {[
                    question.type,
                    question.points && `${question.points} ponto(s)`,
                  ]
                    .filter(Boolean)
                    .join(" | ")}
                </div>
              )}
            </div>
          </div>

          {question.options.length > 0 ? (
            <div className="ml-0 grid gap-2 sm:ml-14">
              {question.options.map((option) => (
                <div
                  key={`${question.number}-${option.letter}`}
                  className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 text-sm"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-700">
                    {option.letter}
                  </span>
                  <span>{option.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ml-0 space-y-4 pt-1 sm:ml-14">
              <div className="border-b border-slate-300 pt-6" />
              <div className="border-b border-slate-300 pt-6" />
              <div className="border-b border-slate-300 pt-6" />
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
