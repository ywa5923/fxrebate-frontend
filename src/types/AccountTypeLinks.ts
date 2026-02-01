import { Url } from "./Url";

export type LinksGroupedByAccountId = {
  [accountTypeId: string]: LinksGroupedByType;
};
export type LinksGroupedByType = {
  [urlType: string]: Url[];
};

export type AccountTypeLinks = {
  linksGroupedByAccountId: LinksGroupedByAccountId;
  masterLinksGroupedByType: LinksGroupedByType;
  linksGroups: Array<string>;
};