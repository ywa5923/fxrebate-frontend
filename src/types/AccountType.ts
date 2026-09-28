import { CompanyList } from "./Company";
import { DynamicTableRow } from "./DynamicTables";

export type AccountTypeApiRow = DynamicTableRow & {
  company_ids?: number[];
  company_id?: number | null;
};

export type AccountTypeRow = AccountTypeApiRow & {
  companies: CompanyList;
};
