/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export class ResultSets {

    private sets: Array<  // multiple result sets
        Array<            // a single result set
            Object // an element of a result set
        >> = [];

    public add(set: Array<Object>) {
        this.sets.push(set);
    }

    /**
     * Finds the elements that are common to all sets.
     *
     * Assuming, one adds the two sets
     *
     *   [{id:'1'}, {id:'2'}, {id:'3'}]
     *   [{id:'2'}, {id:'3'}]
     *
     * intersect would return
     *
     *   [{id:'3'},{id:'2'}] with f = a => a.id
     *
     * @param f gets applied to elements to get the field on which the comparison is performed
     */
    public intersect(f) {

        return this.sets.reduce((p, c) =>
            p.filter(e =>
                c.map(r => f(r)).indexOf(f(e)) !=- 1
            )
        );
    }

    /**
     * Returns a single result set which contains the objects of all result sets
     *
     *  Assuming, one adds the two sets
     *
     *   [{id:'1'}, {id:'2'}, {id:'3'}]
     *   [{id:'2'}, {id:'3'}]
     *
     * unify would return
     *
     *   [{id:'1'}, {id:'2'}, {id:'3'}] with f = a => a.id
     *
     * @param f gets applied to elements to get the field on which the comparison is performed
     */
    public unify(f): Array<Object> {

        const result = {};

        for (let resultSet of this.sets) {
            for (let item of resultSet) {
                result[f(item)] = item;
            }
        }

        return Object.keys(result).map(key => result[key]);
    }
}