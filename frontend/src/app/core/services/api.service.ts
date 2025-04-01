import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { Endpoints } from '@core/misc';
import { CustomObject, ListParams, ListResponse } from '@core/types';

@Injectable()
export class ApiService<T = any, S = CustomObject> {
  protected readonly baseUrl = Endpoints.baseUrl;
  protected url: string;

  constructor(protected http: HttpClient) {}

  /**
   * Zwraca url z endpointa ustawionego jako główny url serwisu.
   */
  getEndpointUrl(): string {
    return this.url;
  }

  protected getUrl(url?: string): string {
    return this.baseUrl + (url || this.url);
  }

  protected getOptions(params: ListParams, requestContext?: HttpContext): { context?: HttpContext; params?: CustomObject } {
    const options: { context?: HttpContext; params?: CustomObject } = {};
    if (params) {
      options.params = params.getParams();
    }
    if (requestContext) {
      options.context = requestContext;
    }
    return options;
  }

  protected buildUrlWithId(id: string): string {
    return id ? `${this.url}${id}/` : this.url;
  }

  getList<R = T>(params = new ListParams(), url?: string, requestContext?: HttpContext): Observable<ListResponse<R>> {
    return this.http.get<ListResponse<R>>(this.getUrl(url), this.getOptions(params, requestContext));
  }

  getListAll<R = T>(params = new ListParams(), url?: string, requestContext?: HttpContext): Observable<R[]> {
    params.pagination.limit = 0;
    return this.http.get<R[]>(this.getUrl(url), this.getOptions(params, requestContext));
  }

  get<R = T>(id: string, url?: string, requestContext?: HttpContext): Observable<R> {
    url = url || this.buildUrlWithId(id);
    return this.http.get<R>(this.getUrl(url), this.getOptions(undefined, requestContext));
  }

  post<R = T, P = S>(data: P, url?: string, params?: ListParams, requestContext?: HttpContext): Observable<R> {
    return this.http.post<R>(this.getUrl(url), data, this.getOptions(params, requestContext));
  }

  put<R = T, P = S>(id: string, data: P, url?: string, requestContext?: HttpContext): Observable<R> {
    url = url || this.buildUrlWithId(id);
    return this.http.put<R>(this.getUrl(url), data, this.getOptions(undefined, requestContext));
  }

  patch<R = T, P = S>(id: string, data: P, url?: string, params?: ListParams, requestContext?: HttpContext): Observable<R> {
    url = url || this.buildUrlWithId(id);
    return this.http.patch<R>(this.getUrl(url), data, this.getOptions(params, requestContext));
  }

  delete<R = T>(id: string, url?: string, requestContext?: HttpContext): Observable<unknown> {
    url = url || this.buildUrlWithId(id);
    return this.http.delete<R>(this.getUrl(url), this.getOptions(undefined, requestContext));
  }
}
