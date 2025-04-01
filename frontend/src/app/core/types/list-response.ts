export interface ListResponse<T> {
  count: number;
  next: string;
  page_size: number;
  previous: string;
  results: T[];
}

export const isListResponse = (data: ListResponse<any> | any[]): data is ListResponse<any> =>
  (data as ListResponse<any>).results !== undefined;
