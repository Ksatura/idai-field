import {Injectable} from '@angular/core';
import {Observable, Observer} from 'rxjs';
import {Constraint, Document, IdaiType, Query} from 'idai-components-2';
import {ConstraintIndex} from './constraint-index';
import {FulltextIndex} from './fulltext-index';
import {ResultSets} from './result-sets';
import {IndexItem} from './index-item';
import {ObserverUtil} from '../../util/observer-util';


@Injectable()
/**
 * @author Daniel de Oliveira
 */
export class IndexFacade {

    private observers: Array<Observer<Document>> = [];

    constructor(
        private constraintIndex: ConstraintIndex,
        private fulltextIndex: FulltextIndex,
        private typesMap: { [typeName: string]: IdaiType }
    ) {}


    public changesNotifications = (): Observable<Document> => ObserverUtil.register(this.observers);


    public perform(query: Query): any {

        let resultSets = query.constraints ?
            this.performConstraints(query.constraints) :
            ResultSets.make();

        resultSets = ResultSets.containsOnlyEmptyAddSets(resultSets)
                || (Query.isEmpty(query) && !ResultSets.isEmpty(resultSets))
            ? resultSets
            : IndexFacade.performFulltext(this.fulltextIndex, query, resultSets);

        return IndexItem.generateOrderedResultList(ResultSets.collapse(resultSets));
    }


    public put(document: Document, skipRemoval: boolean = false, notify: boolean = true) {

        ConstraintIndex.put(this.constraintIndex, document, skipRemoval);
        FulltextIndex.put(this.fulltextIndex, document,
            this.typesMap, skipRemoval);

        if (notify) ObserverUtil.notify(this.observers, document);
    }


    public remove(document: Document) {

        ConstraintIndex.remove(this.constraintIndex, document);
        FulltextIndex.remove(this.fulltextIndex, document);

        ObserverUtil.notify(this.observers, document);
    }


    public clear() {

        ConstraintIndex.clear(this.constraintIndex);
        FulltextIndex.clear(this.fulltextIndex);
    }


    private performConstraints(constraints: { [name: string]: Constraint|string|string[] }): ResultSets {

        return Object.keys(constraints)
            .reduce((resultSets: ResultSets, name: string) => {
                const {type, value} = Constraint.convertTo(constraints[name]);
                ResultSets.combine(resultSets, ConstraintIndex.get(this.constraintIndex, name, value), type);
                return resultSets;
            }, ResultSets.make());
    }


    private static performFulltext(fulltextIndex: FulltextIndex, query: Query, resultSets: ResultSets): ResultSets {

        const q = !query.q || query.q.trim() === '' ? '*' : query.q;
        ResultSets.combine(resultSets, FulltextIndex.get(fulltextIndex, q, query.types));

        return resultSets;
    }
}