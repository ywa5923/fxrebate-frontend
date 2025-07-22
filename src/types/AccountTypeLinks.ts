import { Url } from "./Url";

export type LinksGroupedByAccountId = {
  [accountTypeId: string]: LinksGroupedByType;
};
export type LinksGroupedByType = {
  [urlType: string]: Url[];
};