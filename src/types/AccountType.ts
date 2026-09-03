import { CompanyListItem } from "./Company";
import { DynamicTableRow } from "./DynamicTables";

export type AccountTypeApiRow = DynamicTableRow & {
  company_id?: number | null;
};

export type AccountTypeRow = DynamicTableRow & {
  company_id?: number | null;
  company?: CompanyListItem | null;
};
