import {intersect, NestedArray, subtract, unite} from '../../../util/list-util';
import {SimpleIndexItem} from './index-item';
import {ObjectUtil} from '../../../util/object-util';


type IndexItemMap = {[id: string]: SimpleIndexItem};

/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export class ResultSets {

    // Hide constructor on purpose to force usage of make or copy.
    // This way one can not modify the sets directly. One can
    // only start with make or copy and then modify via combine.
    private constructor(

        private addSets: NestedArray<string>,
        private subtractSets: NestedArray<string>,
        private map: IndexItemMap
    ) {}


    public static make(): ResultSets {

        return new ResultSets ([], [], {})
    }


    public copy(): ResultSets {

        return new ResultSets(
            ObjectUtil.cloneAny(this.addSets),
            ObjectUtil.cloneAny(this.subtractSets),
            ObjectUtil.cloneAny(this.map)
        );
    }


    public isEmpty(): boolean {

        return this.addSets.length == 0 && this.subtractSets.length == 0;
    }



    public combine(
        indexItems: Array<SimpleIndexItem>|undefined,
        mode: string = 'add'): ResultSets {

        const copy = this.copy();
        if (!indexItems) return copy;

        ResultSets.putTo(copy.map, indexItems);

        if (mode !== 'subtract') copy.addSets.push(indexItems.map(item => item.id));
        else copy.subtractSets.push(indexItems.map(item => item.id));

        return copy;
    }


    /**
     * Finds the elements that are common to all sets.
     * Elements from subtract sets are removed from the result.
     *
     * Assuming, one adds the two add sets
     *
     *   [{id:'1'}, {id:'2'}, {id:'3'}]
     *   [{id:'2'}, {id:'3'}]
     *
     *   and the subtract set
     *
     *   [{id:'3'}]
     *
     * collapse would return
     *
     *   [{id:'2'}]
     */
    public collapse(): Array<SimpleIndexItem> {

        return ResultSets.pickFrom(this.map,

            subtract(this.subtractSets)(intersect(this.addSets))
        );
    }


    /**
     * Returns a single result set which contains the objects of all add sets
     *
     *  Assuming, one adds the two sets
     *
     *   [{id:'1'}, {id:'2'}, {id:'3'}]
     *   [{id:'2'}, {id:'3'}]
     *
     * unify would return
     *
     *   [{id:'1'}, {id:'2'}, {id:'3'}]
     */
    public unify(): Array<SimpleIndexItem> {

        return ResultSets.pickFrom(this.map,

            unite(this.addSets)
        );
    }


    private static putTo(map: IndexItemMap, set: Array<SimpleIndexItem>): void {

        set.forEach(item => map[item.id] = item);
    }


    private static pickFrom(map: IndexItemMap, indices: Array<string>):
        Array<SimpleIndexItem> {

        return indices.reduce((acc, index: string) => {
                acc.push(map[index] as never);
                return acc;
            }, []);
    }
}