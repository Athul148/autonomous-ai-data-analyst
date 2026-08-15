interface CorrelationSummaryProps {
  totalVariables: number;
  strongCorrelations: number;
  positiveCorrelations: number;
  negativeCorrelations: number;
}

function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function CorrelationSummary({
  totalVariables,
  strongCorrelations,
  positiveCorrelations,
  negativeCorrelations,
}: CorrelationSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card
        title="Variables"
        value={totalVariables}
      />

      <Card
        title="Strong Correlations"
        value={strongCorrelations}
      />

      <Card
        title="Positive"
        value={positiveCorrelations}
      />

      <Card
        title="Negative"
        value={negativeCorrelations}
      />
    </div>
  );
}

export default CorrelationSummary;