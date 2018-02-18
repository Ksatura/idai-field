import {Injectable} from '@angular/core';
import {Datastore} from 'idai-components-2/datastore';
import {Document} from 'idai-components-2/core';
import {PouchdbDatastore} from './pouchdb-datastore';
import {DocumentCache} from './document-cache';
import {CachedReadDatastore} from './cached-read-datastore';
import {TypeConverter} from './type-converter';
import {IndexFacade} from "../index/index-facade";


@Injectable()
/**
 * Returns fully checked instances of
 * IdaiFieldDocument and IdaiFieldImageDocument respectively,
 * so that the rest of the app can rely that the declared
 * fields are present.
 *
 * @author Daniel de Oliveira
 * @author Sebastian Cuy
 * @author Thomas Kleinke
 */
export abstract class CachedDatastore<T extends Document>
    extends CachedReadDatastore<T> {

    constructor(
        datastore: PouchdbDatastore,
        indexFacade: IndexFacade,
        documentCache: DocumentCache<T>,
        typeConverter: TypeConverter,
        typeClass: string) {

        super(datastore, indexFacade, documentCache, typeConverter, typeClass);
    }


    /**
     * Implements {@link Datastore#create}
     *
     * @throws if document is not of type T, determined by resource.type
     * @throws if resource.type is unknown
     */
    public async create(document: Document): Promise<T> {

        this.typeConverter.validate([document.resource.type], this.typeClass);

        return this.documentCache.set(this.typeConverter.
            convert<T>(await this.datastore.create(document)));
    }


    /**
     * Implements {@link Datastore#update}
     *
     * @throws if document is not of type T, determined by resource.type
     */
    public async update(document: Document): Promise<T> {

        this.typeConverter.validate([document.resource.type], this.typeClass);

        const updatedDocument = this.typeConverter.
            convert<T>(await this.datastore.update(document));

        if (!this.documentCache.get(document.resource.id as any)) {
            return this.documentCache.set(updatedDocument);
        } else {
            this.documentCache.reassign(updatedDocument);
            return this.documentCache.get(document.resource.id as any);
        }
    }


    /**
     * @throws if document is not of type T, determined by resource.type
     */
    public async remove(document: Document): Promise<void> {

        this.typeConverter.validate([document.resource.type], this.typeClass);

        await this.datastore.remove(document);
        this.documentCache.remove(document.resource.id);
    }


    public removeRevision(docId: string, revisionId: string): Promise<void> {

        return this.datastore.removeRevision(docId, revisionId);
    }
}
