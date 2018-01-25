/// <reference path="desktop/express-import" />

import {Injectable} from "@angular/core";
import * as express from 'express';

const remote = require('electron').remote;
const expressPouchDB = require('express-pouchdb');

import {Document} from 'idai-components-2/core';
import {ResourcesState} from "./components/resources/state/resources-state";
import {PouchdbManager} from "./core/datastore/core/pouchdb-manager";
import {DocumentCache} from "./core/datastore/core/document-cache";
import {ImagesState} from "./components/imageoverview/view/images-state";

@Injectable()
/**
 * @author Daniel de Oliveira
 */
export class AppController {

    constructor(
        private pouchdbManager: PouchdbManager,
        private resourcesState: ResourcesState,
        private documentCache: DocumentCache<Document>,
        private imagesState: ImagesState) {
    }

    public setupServer(): Promise<any> {
        return new Promise(resolve => {

            if (!remote.getGlobal('switches').provide_reset) return resolve();

            const control = express();
            control.post('/reset', (req: any, res: any) => {
                this.pouchdbManager.resetForE2E();
                this.resourcesState.resetForE2E();
                this.documentCache.resetForE2E();
                this.imagesState.resetForE2E();
                res.send('done');
            });
            control.listen(3003, function() {
                console.log('App Control listening on port 3003');
                resolve();
            });
        })
    }
}