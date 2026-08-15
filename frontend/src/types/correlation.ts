export interface StrongCorrelation {
  feature_1: string;
  feature_2: string;
  correlation: number;
  strength: string;
  direction: "positive" | "negative";
}

export interface CorrelationResponse {
  correlation_matrix: Record<
    string,
    Record<string, number>
  >;
  strong_correlations: StrongCorrelation[];
}