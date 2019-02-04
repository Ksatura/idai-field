import {Injectable} from '@angular/core';
import {IdaiFieldDocument, IdaiFieldImageDocument} from 'idai-components-2';
import {ImageOverviewFacade} from '../view/imageoverview-facade';
import {Imagestore} from '../../../core/imagestore/imagestore';
import {PersistenceManager} from "../../../core/model/persistence-manager";
import {UsernameProvider} from '../../../core/settings/username-provider';
import {M} from '../../m';
import {clone} from '../../../core/util/object-util';


@Injectable()
/**
 * @author Daniel de Oliveira
 * @author Sebastian Cuy
 * @author Thomas Kleinke
 */
export class PersistenceHelper {

    constructor(
        private imageOverviewFacade: ImageOverviewFacade,
        private persistenceManager: PersistenceManager,
        private usernameProvider: UsernameProvider,
        private imagestore: Imagestore
    ) {}


    public deleteSelectedImageDocuments(): Promise<any> {

        return new Promise<any>((resolve, reject) => {

            let promise: Promise<any> = new Promise<any>((res) => res());

            for (let document of this.imageOverviewFacade.getSelected()) {
                if (!document.resource.id) continue;
                const resourceId = document.resource.id;

                promise = promise.then(
                    () => this.imagestore.remove(resourceId),
                    msgWithParams => reject(msgWithParams)
                ).then(
                    () => this.persistenceManager.remove(document, this.usernameProvider.getUsername()),
                    err => reject([M.IMAGESTORE_ERROR_DELETE, document.resource.identifier])
                ).then(() => {
                    this.imageOverviewFacade.remove(document);
                })
            }

            promise.then(
                () => resolve(),
                msgWithParams => reject(msgWithParams)
            );
        });
    }


    public async addRelationsToSelectedDocuments(targetDocument: IdaiFieldDocument) {

        for (let imageDocument of this.imageOverviewFacade.getSelected()) {
            const oldVersion: IdaiFieldImageDocument = clone(imageDocument);
            const depictsRelations: string[] = imageDocument.resource.relations.depicts;

            if (depictsRelations.indexOf(targetDocument.resource.id) === -1) {
                depictsRelations.push(targetDocument.resource.id);
            }

            await this.persistenceManager.persist(
                imageDocument, this.usernameProvider.getUsername(), oldVersion
            );
        }
    }


    public async removeRelationsOnSelectedDocuments() {

        for (let document of this.imageOverviewFacade.getSelected()) {
            const oldVersion: IdaiFieldImageDocument = clone(document);
            document.resource.relations.depicts = [];

            await this.persistenceManager.persist(
                document, this.usernameProvider.getUsername(), oldVersion
            );
        }
    }
}