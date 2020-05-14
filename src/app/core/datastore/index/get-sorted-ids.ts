import {equal, is, isNot, on, Pair, to, sort, count, flow, map, tuplify, flatten, compose,
    undefinedOrEmpty, size, isUndefinedOrEmpty, cond, pairWith, left} from 'tsfun';
import {separate} from 'tsfun/collection';
import {Query, Resource} from 'idai-components-2';
import {IndexItem, TypeResourceIndexItem} from './index-item';
import {SortUtil} from '../../util/sort-util';
import {Name, ResourceId} from '../../constants';


/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */


const INSTANCES = 'instances';
const TYPE = 'Type';

type Percentage = number;


/**
 * If not specified otherwise, indexItems get sorted
 * alphanumerically by their identifier property.
 *
 * @param indexItems
 * @param query
 *   - if query.categories === ['Type'],
 *     query.sort.matchType can be set
 *   . in order to perform a ranking of Type resources then.
 *     if query.sort.matchCategory is not set, a regular
 *     sort gets performed instead.
 *   - if query.sort.mode === 'exactMatchFirst', then, after sorting,
 *     puts an element which matches the query exactly, to the
 *     front of the resulting list.
 */
export function getSortedIds(indexItems: Array<IndexItem>, query: Query): Array<ResourceId> {

    const rankEntries = shouldRankCategories(query)
        ? rankTypeResourceIndexItems((query.sort as any).matchCategory)
        : rankRegularIndexItems;

    const handleExactMatchIfQuerySaysSo =
        cond(
            shouldHandleExactMatch(query),
            handleExactMatch(query.q as string));

    return flow(
        indexItems,
        rankEntries,
        handleExactMatchIfQuerySaysSo,
        map(to(Resource.ID)) as any /* TODO review any */);
}


function shouldHandleExactMatch(query: Query) {

    return query.sort?.mode === 'exactMatchFirst' && isNot(undefinedOrEmpty)(query.q)
}


function shouldRankCategories(query: Query) {

    return equal(query.categories)([TYPE]) && query.sort?.matchCategory;
}


function comparePercentages([itemA, pctgA]: Pair<TypeResourceIndexItem, Percentage>,
                            [itemB, pctgB]: Pair<TypeResourceIndexItem, Percentage>) {

    if (pctgA < pctgB) return 1;
    if (pctgA > pctgB) return -1;

    if (size(itemA.instances) < size(itemB.instances)) return 1;
    if (size(itemA.instances) > size(itemB.instances)) return -1;

    return SortUtil.alnumCompare(itemA.identifier, itemB. identifier);
}


/**
 * { id: '1', instances: { '2', 'T1', '3': 'T2' }}
 * categoryToMatch = 'T1'
 * ->
 * 50
 */
const calcPercentage = (categoryToMatch: Name): (indexItem: TypeResourceIndexItem) => number =>
    compose(
        to(INSTANCES),
        cond(isUndefinedOrEmpty,
            0,
            compose(
                tuplify(count(is(categoryToMatch)), size),
                ([numMatching, numTotal]: any) => numMatching * 100 / numTotal
            )
        )
    );


/**
 * [{identifier: 'a'}, {identifier: 'b'}, {identifier: 'c'}]
 * q = 'b'
 * ->
 * [{identifier: 'b'}, {identifier: 'a'}, {identifier: 'c'}]
 */
const handleExactMatch = (q: string)
    : (indexItems: Array<IndexItem>) => Array<IndexItem> =>
     compose(
        separate(on(Resource.IDENTIFIER, is(q))),
        flatten() as any /* TODO review any */);


const rankRegularIndexItems
    : (indexItems: Array<IndexItem>) => Array<IndexItem> =
    sort((a: IndexItem, b: IndexItem) =>
        SortUtil.alnumCompare(a.identifier, b.identifier));


/**
 * [{id: '3', instances: {'7': 'T2'}}
 *  {id: '2', instances: {'4': 'T1', '6': 'T2'}}
 *  {id: '1', instances: {'4': 'T1', '5': 'T1'}}
 *  {id: '0', instances: {'4': 'T1', '5': 'T1', '8': 'T1'}}]
 * categoryToMatch = 'T1'
 * ->
 * [{id: '0', instances: {'4': 'T1', '5': 'T1', '8': 'T1'}} // 100%, 3 matches
 *  {id: '1', instances: {'4': 'T1', '5': 'T1'}}            // 100%, 2 matches
 *  {id: '2', instances: {'4': 'T1', '6': 'T2'}}            // 50%
 *  {id: '3', instances: {'7': 'T2'}}]                      // 0%
 */
const rankTypeResourceIndexItems = (categoryToMatch: Name): (indexItems: Array<IndexItem>) =>
    Array<IndexItem> => compose(
        map(pairWith(calcPercentage(categoryToMatch))),
        sort(comparePercentages) as any /* TODO review any */,
        map(left)) as any /* TODO review any*/;
