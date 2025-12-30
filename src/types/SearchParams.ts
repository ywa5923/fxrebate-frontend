export type SearchParams<T> = PageAndOrderSearchParams & Partial<T>;

 export type PageAndOrderSearchParams = {
  page?: string;
  per_page?: string;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
 }