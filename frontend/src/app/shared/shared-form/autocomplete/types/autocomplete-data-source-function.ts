import { Observable } from 'rxjs';

import { ListParams, ListResponse } from '@core/types';

export type AutocompleteDataSourceFunction<T> = (params: ListParams, id?: any) => Observable<T[] | ListResponse<T>>;
