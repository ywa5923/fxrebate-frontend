import { OptionValue } from "./OptionValue";

export type DynamicTableRow = {
    id: number;
    broker_id?: number;
    option_values: OptionValue[]|null;
}