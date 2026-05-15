import { Regulator } from "./Regulator";
import { DynamicTableRow } from "./DynamicTables";

export type Company = DynamicTableRow & {
    regulators: Regulator[];
}
