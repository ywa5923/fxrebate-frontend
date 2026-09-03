import { Regulator } from "./Regulator";
import { DynamicTableRow } from "./DynamicTables";

export type Company = DynamicTableRow & {
    regulators: Regulator[];
}

export type CompanyListItem = {
    id: number;
    name: string;
}

export type CompanyList = CompanyListItem[];
