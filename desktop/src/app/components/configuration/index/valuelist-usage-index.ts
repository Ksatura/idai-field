import { filter, flatMap, flow, isDefined, map, on, to } from 'tsfun';
import { CategoryForm, Valuelist } from 'idai-field-core';


export interface ValuelistUsageIndex {

    [valuelistId: string]: Array<ValuelistUsage>;
}


export interface ValuelistUsage {

    category: CategoryForm;
    fields: string[];
}


/**
 * @author Thomas Kleinke
 */
export namespace ValuelistUsageIndex {

    export function create(valuelists: Array<Valuelist>, usedCategories: Array<CategoryForm>): ValuelistUsageIndex {

        return valuelists.reduce((index, valuelist) => {
    
            index[valuelist.id] = fetchUsingFields(usedCategories, valuelist.id);
            return index;
        }, {});
    }


    export function get(index: ValuelistUsageIndex, valuelistId: string): Array<ValuelistUsage> {

        return index[valuelistId];
    }


    function fetchUsingFields(categories: Array<CategoryForm>, valuelistId: string): Array<ValuelistUsage> {

        return categories.map(category => {
            return {
                category,
                fields: fetchUsingFieldsForCategory(category, valuelistId)
            };
        })
        .filter(resultItem => resultItem.fields.length > 0);
    }


    function fetchUsingFieldsForCategory(category: CategoryForm, valuelistId: string): string[] {

        return flow(
            category.groups,
            flatMap(to('fields')),
            filter(on('valuelist', isDefined)),
            filter(on(['valuelist', 'id'], valuelistId)),
            map(to('name'))
        );
    }
}
