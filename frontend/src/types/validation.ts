export interface ValidationIssue {
  type: string;
  count: number;
  message: string;
}

export interface ColumnValidation {
  column: string;
  issues: ValidationIssue[];
}

export interface ValidationResponse {
  numeric: ColumnValidation[];
  categorical: ColumnValidation[];
  identifier: ColumnValidation[];
}