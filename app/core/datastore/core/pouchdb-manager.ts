import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import * as PouchDB from 'pouchdb';
import {PouchdbProxy} from './pouchdb-proxy';
import {SampleDataLoader} from './sample-data-loader';
import {SyncState} from './sync-state';
import {IndexFacade} from '../index/index-facade';

const remote = require('electron').remote;


@Injectable()
/**
 * Manages the creation of PouchDB instances.
 * Also handles loading of sample data if 'test' database is selected.
 * @author Sebastian Cuy
 * @author Daniel de Oliveira
 */
export class PouchdbManager {

    private db: any = undefined;
    private dbProxy: PouchdbProxy|undefined = undefined;
    private name: string|undefined = undefined;
    private syncHandles = [];

    private resolveDbReady: Function|undefined = undefined;


    constructor(private sampleDataLoader: SampleDataLoader,
                private indexFacade: IndexFacade) {

        const dbReady = new Promise(resolve => this.resolveDbReady = resolve as any);
        this.dbProxy = new PouchdbProxy(dbReady);
    }


    public resetForE2E() {

        const dbReady = new Promise(resolve => this.resolveDbReady = resolve as any);
        Object.assign(this.dbProxy, new PouchdbProxy(dbReady));
        this.setProject('test');
    }


    public setProject(name: string) {

        this.name = name;

        let rdy: Promise<any> = Promise.resolve();

        if (this.db) {
            rdy = rdy.then(() => {
                this.db.close();
                this.db = undefined;
            });
        }

        rdy = rdy.then(() => this.createPouchDBObject(name));
        if ((name == 'test')) {
            rdy = rdy.then(() => this.db.destroy()).then(() => this.createPouchDBObject(name));
        }
        if (name == 'test') {
            rdy = rdy.then(config => this.sampleDataLoader.go(this.db, this.name as any));
        }

        rdy.then(() => this.index());
    }


    /**
     * Setup peer-to-peer syncing between this datastore and target.
     * Changes to sync state will be published via the onSync*-Methods.
     * @param url target datastore
     */
    public setupSync(url: string): Promise<SyncState> {

        const fullUrl = url + '/' + this.name;
        console.log('start syncing');

        return (this.getDb() as any).ready().then((db: any) => {
            let sync = db.sync(fullUrl, { live: true, retry: false });
            this.syncHandles.push(sync as never);
            return {
                url: url,
                cancel: () => {
                    sync.cancel();
                    this.syncHandles.splice(this.syncHandles.indexOf(sync as never), 1);
                },
                onError: Observable.create((obs: any) => sync.on('error', (err: any) => obs.next(err))),
                onChange: Observable.create((obs: any) => sync.on('change', () => obs.next()))
            };
        });
    }


    public stopSync() {

        console.log('stop sync');

        for (let handle of this.syncHandles) {
            console.debug('stop sync', handle);
            (handle as any).cancel();
        }
        this.syncHandles = [];
    }


    /**
     * Gets the database object.
     * @returns {PouchdbProxy} a proxy that automatically hands over method
     *  calls to the actual PouchDB instance as soon as it is available
     */
    public getDb(): PouchdbProxy {

        return this.dbProxy as PouchdbProxy;
    }


    /**
     * Destroys the db named dbName, if it is not the currently selected active database
     *
     * @param dbName
     * @returns {any}
     *   Rejects with undefined if trying do delete the currently active database
     */
    public destroyDb(dbName: string): Promise<any> {

        return this.createPouchDBObject(dbName).destroy();
    }


    /**
     * Creates a new database. Unless specified specifically
     * with remote.getGlobal('switches').destroy_before_create set to true,
     * a possible existing database with the specified name will get used
     * and not overwritten.
     *
     */
    public async createDb(name: string, doc: any) {

        let db = this.createPouchDBObject(name);

        let promise = Promise.resolve();
        if (remote.getGlobal('switches') && remote.getGlobal('switches').destroy_before_create) {
            promise = db.destroy().then(() =>
                db = this.createPouchDBObject(name)
            );
        }

        await promise;
        return db.get(name)
            // create project only if it does not exist,
            // which can happen if the db already existed
            .catch(() => db.put(doc));
    }


    private index() {

        return this.db.allDocs({
            include_docs: true,
            conflicts: true
        }, (err: any, resultDocs: any) => {
            this.indexFacade.clear();

            (resultDocs.rows as Array<any>)
                .filter(row => !PouchdbManager.isDesignDoc(row))
                .forEach(row => this.indexFacade.put(row.doc, true, false));

            (this.resolveDbReady as any)(this.db);
        });
    }


    private createPouchDBObject(name: string): any {

        this.db = new PouchDB(name);
        if (console.debug) console.debug('PouchDB is using adapter', this.db.adapter);

        return this.db;
    }


    private static isDesignDoc(row: any) {

        return row.id.indexOf('_') == 0
    }
}