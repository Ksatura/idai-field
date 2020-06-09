import {drop, identity, includedIn, is, isArray, isNot, on, take} from 'tsfun';
import {findInTree, ITEMNAMEPATH, Treelist} from './treelist';
import {Named, onName} from './named';
import {Name} from '../constants';


export function findInNamedTreelist<N extends Named>(match: Name, t: Treelist<N>): N|undefined {

    const result = findInTree(t, onName( is(match)));
    return result ? result.item : undefined;
}


export function filterTrees<N extends Named>(t: Treelist<N>, match: Name, ...moreMatches: Name[]): Treelist<N>;
export function filterTrees<N extends Named>(match: Name, ...moreMatches: Name[]): (t: Treelist<N>) => Treelist<N>;
export function filterTrees<N extends Named>(a: any, ...bs: any[]): any {

    return _filterTrees(false, a, bs);
}


export function removeTrees<N extends Named>(t: Treelist<N>, match: Name, ...moreMatches: Name[]): Treelist<N>;
export function removeTrees<N extends Named>(match: Name, ...moreMatches: Name[]): (t: Treelist<N>) => Treelist<N>;
export function removeTrees<N extends Named>(a: any, ...bs: any[]): any {

    return _filterTrees(true, a, bs);
}


export function isTopLevelItemOrChildThereof(t: Treelist<Named>,
                                             match: Name,
                                             firstLevelItem: Name,
                                             ...moreFirstLevelItems: Name[]): boolean {

    const filtered = filterTrees(t, firstLevelItem, ...moreFirstLevelItems);
    return findInNamedTreelist(match, filtered) !== undefined;
}


function _filterTrees<N extends Named>(invert: boolean, a: any, bs: any[]): Treelist<N> {

    const $ = (t: any, match: any, moreMatches: any) => t.filter(
        on(ITEMNAMEPATH,
            ((invert ? isNot : identity)(includedIn([match].concat(moreMatches))))
        ));

    return isArray(a)
        ? $(a, take(1, bs)[0], drop(1, bs))
        : (t: any) => $(t, a, bs);
}
