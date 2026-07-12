import { DropdownListOption } from "./DropdownList";
import { Url } from "./Url";

export type LinksGroupedByEntityId = {
  [entityId: string]: LinksGroupedByType;
};

export type LinksGroupedByType = {
  [urlType: string]: Url[];
};


const LINK_GROUPS = ["trading-platform",
    "mobile-platform",
    "spread-type",
    "swap",
    "commission"] as const;

export type LinkGroup = (typeof LINK_GROUPS)[number];

export type LinksOptions = Partial<Record<LinkGroup, DropdownListOption[]>>;

export type EntityTypeLinks = {
  links_grouped_by_entity_id: LinksGroupedByEntityId;
  master_links_grouped_by_type: LinksGroupedByType;
  links_groups:  LinkGroup[]; // sau typeof LINK_GROUPS
  links_options: LinksOptions;
};

