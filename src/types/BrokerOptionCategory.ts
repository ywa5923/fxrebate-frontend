import { BrokerOption } from "./";

export interface BrokerOptionCategory {
    id: string | number;
    name: string;
    slug: string;
    description: string;
    icon?: string;
    color?: string;
    background_color?: string;
    text_color?: string;
    border_color?: string;
    font_weight?: string;
    position?: string|number;
    default_language?: string;
    options: Array<BrokerOption>;
  }