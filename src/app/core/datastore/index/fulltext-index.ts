import {flatMap, flow, filter, split, toLowerCase, empty, isNot, isEmpty, keys,
    Map, forEach} from 'tsfun';
import {lookup, map} from 'tsfun/associative';
import {Document, Resource} from 'idai-components-2';
import {ResultSets} from './result-sets';
import {Category} from '../../configuration/model/category';
import {toArray} from '../../util/utils';
import {addUniquely} from './index-helpers';


export interface FulltextIndex {

    [category: string]: {
        [term: string]:
            Array<Resource.Id>
    }
}


/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export module FulltextIndex {

    const defaultFieldsToIndex = ['identifier', 'shortDescription'];

    const tokenizationPattern: RegExp = /[ -]/;


    export function put(index: FulltextIndex,
                        document: Document,
                        categoriesMap: { [categoryName: string]: Category },
                        skipRemoval: boolean = false) {

        if (!skipRemoval) remove(index, document);
        if (!index[document.resource.category]) {
            index[document.resource.category] = { '*' : [] } ;
        }
        index[document.resource.category]['*'] = addUniquely(index[document.resource.category]['*'], document.resource.id);

        flow(
            getFieldsToIndex(categoriesMap, document.resource.category),
            filter(lookup(document.resource)),
            filter((field: any) => document.resource[field] !== ''),
            map(lookup(document.resource)),
            flatMap(split(tokenizationPattern)),
            map(toLowerCase),
            map(toArray),
            forEach(indexToken(index, document)));
    }


    export function remove(index: FulltextIndex, document: Document) {

        Object.keys(index).forEach(category =>
            Object.keys(index[category])
                .forEach(term => {
                    index[category][term] = index[category][term].filter(_ => _ !== document.resource.id);
                }))
    }


    /**
     * @param index
     * @param s search string, which gets tokenized, so that the result will include
     *   search hits for any of the tokens. If s is "hello world", all items which are
     *   indexed under either "hello" or "world" will be included in the result. The
     *   result will be a set in the sense that it will include each item only once.
     * @param categories if undefined, searches in all categories. If defined, only search hits
     *   indexed under the specified categories will be included in the results.
     */
    export function get(index: FulltextIndex,
                           s: string,
                           categories: string[]|undefined): Array<Resource.Id> {

        if (isEmpty(index)) return [];

        const resultSets = s
            .split(tokenizationPattern)
            .filter(isNot(empty))
            .reduce(getFromIndex(index, categories), ResultSets.make());

        return ResultSets.collapse(resultSets) as Array<Resource.Id>;
    }


    function getFromIndex(index: FulltextIndex, categories: string[]|undefined) {

        return (resultSets: ResultSets<Resource.Id>, token: string) => {
            const ids = getForToken(
                index,
                token,
                categories
                    ? categories
                    : keys(index)
            );
            ResultSets.combine(resultSets, ids);
            return resultSets;
        }
    }


    function indexToken(index: FulltextIndex, document: Document,) {

        return (tokenAsCharArray: string[]) => {

            const categoryIndex = index[document.resource.category];

            tokenAsCharArray.reduce((accumulator, letter) => {
                accumulator += letter;
                if (!categoryIndex[accumulator]) categoryIndex[accumulator] = [];
                categoryIndex[accumulator] = addUniquely(categoryIndex[accumulator], document.resource.id);
                return accumulator;
            }, '');
        }
    }


    function getFieldsToIndex(categoriesMap: Map<Category>, categoryName: string): string[] {

        return !categoriesMap[categoryName]
            ? []
            : Category.getFields(categoriesMap[categoryName])
                .filter(field => field.fulltextIndexed)
                .map(field => field.name)
                .concat(defaultFieldsToIndex);
    }


    function extractReplacementTokens(s: string) {

        const positionOpen = s.indexOf('[');
        const positionClose = s.indexOf(']');
        return positionOpen !== -1 && positionClose !== -1 && positionOpen < positionClose ?
            { hasPlaceholder: true, tokens: s.substr(positionOpen+1, positionClose-positionOpen-1)} :
            { hasPlaceholder: false, tokens: ''};
    }


    function getForToken(index: FulltextIndex, token: string, categories: string[]): Array<any> {

        const s = token.toLowerCase();

        function get(resultSets: ResultSets<Resource.Id>, category: string): ResultSets<Resource.Id> {

            const {hasPlaceholder, tokens} = extractReplacementTokens(s);
            return hasPlaceholder
                ? getWithPlaceholder(index, resultSets, s, category, tokens)
                : addKeyToResultSets(index, resultSets, category, s);
        }

        return ResultSets.unifyAddSets(categories.reduce(get, ResultSets.make()));
    }


    function getWithPlaceholder(index: FulltextIndex,
                                resultSets: ResultSets<Resource.Id>,
                                s: string,
                                category: string,
                                tokens: string): ResultSets<Resource.Id> {

        return tokens.split('').reduce((_resultSets, nextChar: string) =>
                addKeyToResultSets(
                    index, _resultSets, category, s.replace('[' + tokens + ']', nextChar)
                )
            , resultSets);
    }


    function addKeyToResultSets(index: FulltextIndex,
                                resultSets: ResultSets<Resource.Id>,
                                category: string,
                                s: string): ResultSets<Resource.Id> {

        if (!index[category] || !index[category][s]) return resultSets;

        ResultSets.combine(resultSets, index[category][s]);
        return resultSets;
    }
}
