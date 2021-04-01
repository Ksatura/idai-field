import {Document} from 'idai-field-core';
import {FieldResource, Category, Query} from 'idai-field-core';
import { IdaiFieldFindResult } from '../datastore/cached/cached-datastore';


export type Count = number; // -1 signals that there is not usable count
export type CategoryCount = [Category, Count];

export type Find = (query: Query) => Promise<IdaiFieldFindResult<Document>>;
export type GetIdentifierForId = (resourceId: string) => Promise<string>;
export type PerformExport = (category: Category, relations: string[])
    => (resources: Array<FieldResource>) => Promise<void>;
