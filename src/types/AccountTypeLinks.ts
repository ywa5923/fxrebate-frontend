import { Url } from "./Url";

export type LinksGroupedByAccountId = {
  [accountTypeId: string]: LinksGroupedByType;
};
export type LinksGroupedByType = {
  [urlType: string]: Url[];
};

export type AccountTypeLinks = {
  links_grouped_by_account_id: LinksGroupedByAccountId;
  master_links_grouped_by_type: LinksGroupedByType;
  links_groups: Array<string>;
};