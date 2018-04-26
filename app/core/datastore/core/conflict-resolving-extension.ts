import {Injectable} from '@angular/core';
import {Document} from 'idai-components-2/core';
import {PouchdbDatastore} from './pouchdb-datastore';
import {ConflictResolver} from './conflict-resolver';
import {RevisionHelper} from './revision-helper';
import {ChangeHistory} from '../../model/change-history';
import {M} from '../../../m';
import {PouchdbProxy} from './pouchdb-proxy';

@Injectable()
/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class ConflictResolvingExtension {


    public promise: Promise<any> = Promise.resolve();

    private inspectedRevisionsIds: string[] = [];
    private datastore: PouchdbDatastore;
    private db: PouchdbProxy;
    private conflictResolver: ConflictResolver;


    public setDatastore = (datastore: PouchdbDatastore) => this.datastore = datastore;

    public setDb = (db: PouchdbProxy) => this.db = db;

    public setConflictResolver = (conflictResolver: ConflictResolver) => this.conflictResolver = conflictResolver;


    public autoResolve(document: Document, userName: string): Promise<any> {
        
        if (!this.datastore) return Promise.reject('no datastore');
        if (!this.db) return Promise.reject('no db');
        if (!this.conflictResolver) return Promise.reject('no conflict resolver');

        if (ConflictResolvingExtension.hasUnhandledConflicts(this.inspectedRevisionsIds, document)) {
            return this.fetchHistory(document.resource.id as any).then((history: any) =>
                this.handleConflicts(document, userName, history));
        } else {
            return Promise.resolve(undefined);
        }
    }


    private handleConflicts(document: Document, userName: string, history: any): Promise<any> {

        return this.getConflictedRevisionsForUser(document, userName).then(conflictedRevisions => {
            let promise: Promise<any> = Promise.resolve();
            for (let conflictedRevision of conflictedRevisions) {
                promise = promise.then(() => this.handleConflict(document, conflictedRevision, history));
            }
            return promise;
        });
    }


    private handleConflict(document: Document, conflictedRevision: Document, history: any): Promise<any> {

        this.inspectedRevisionsIds.push((conflictedRevision as any)['_rev']);

        return this.datastore.fetchRevision(conflictedRevision.resource.id as any,
                    RevisionHelper.getPreviousRevisionId(history, conflictedRevision) as any)
            .then(previousRevision =>
                this.solveConflict(document, conflictedRevision, previousRevision)
            );
    }


    private solveConflict(document: Document, conflictedRevision: Document, previousRevision: Document) {

        const updatedDocument = this.conflictResolver.tryToSolveConflict(
            document, conflictedRevision, previousRevision);

        if (updatedDocument) {
            // ChangeHistory.mergeChangeHistories(document, conflictedRevision);

            return this.db.put(updatedDocument, { force: true }).then(() => {
                if (!updatedDocument['unresolvedConflicts']) {
                    return this.datastore.removeRevision(document.resource.id as any, (conflictedRevision as any)['_rev']);
                }
            });
        }
    }


    private getConflictedRevisionsForUser(document: Document, userName: string): Promise<Array<Document>> {

        const promises: Array<Promise<Document>> = [];

        for (let revisionId of (document as any)['_conflicts']) {
            promises.push(this.datastore.fetchRevision(document.resource.id as any, revisionId));
        }

        return Promise.all(promises)
            .catch(() => Promise.reject([M.DATASTORE_NOT_FOUND]))
            .then(revisions => ConflictResolvingExtension.getOnlyUserRevisions(revisions, userName));
    }


    private fetchHistory(resourceId: string) {

        return this.datastore.fetch(resourceId, { revs_info: true })
            .then(doc => (doc as any)['_revs_info']);
    }


    /**
     * @param revisionsDocuments
     * @param userName
     * @returns {Array<Document>} the conflicted revisions to
     *   actually to be resolved within this client. These are the ones having the
     *   clients current userName as the name of the lastAction of the revision.
     */
    private static getOnlyUserRevisions(revisionsDocuments: Array<Document>, userName: string) {

        const result: Array<Document> = [];

        for (let revisionDocument of revisionsDocuments) {
            if (ChangeHistory.getLastModified(revisionDocument).user == userName) {
                result.push(revisionDocument);
            }
        }

        return result;
    }


    private static hasUnhandledConflicts(inspectedRevisionsIds: string[], document: Document): boolean {

        if (!(document as any)['_conflicts']) return false;

        for (let revisionId of (document as any)['_conflicts']) {
            if (inspectedRevisionsIds.indexOf(revisionId) == -1) return true;
        }

        return false;
    }
}