import { OptionValue } from "./OptionValue";

export type Company = {
    id: number;
    option_values: OptionValue[]|null;
}