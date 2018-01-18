import {Injectable} from '@angular/core';
import {IdaiFieldDocument} from 'idai-components-2/idai-field-model';
import {ImageTypeUtility} from '../../../../common/image-type-utility';
import {IdaiFieldImageDocument} from '../../../../core/model/idai-field-image-document';
import {IdaiFieldImageDocumentReadDatastore} from '../../../../core/datastore/idai-field-image-document-read-datastore';
import {StateFacade} from '../../state/state-facade';
import {ListUtil} from '../../../../util/list-util';


export interface LayersInitializationResult {

    layers: Array<IdaiFieldImageDocument>,
    activeLayersChange: ListDiffResult
}

export interface ListDiffResult {

    added: Array<string>,
    removed: Array<string>
}


@Injectable()
/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class LayerManager {

    private activeLayerIds: Array<string> = [];

    constructor(
        private datastore: IdaiFieldImageDocumentReadDatastore,
        private imageTypeUtility: ImageTypeUtility,
        private viewFacade: StateFacade) {}


    public async initializeLayers(mainTypeDocument: IdaiFieldDocument | undefined)
            : Promise<LayersInitializationResult> {

        try {
            return {
                layers: (await this.datastore.find({
                    q: '',
                    types: this.imageTypeUtility.getImageTypeNames(),
                    constraints: { 'georeference:exist': 'KNOWN' }
                })).documents,
                activeLayersChange: this.fetchActiveLayersFromResourcesState(mainTypeDocument)
            };
        } catch(e) {
            console.error('error with datastore.find', e);
        }

        return Promise.reject(undefined);
    }


    public reset() {

        this.activeLayerIds = [];
    }


    public isActiveLayer(resourceId: string): boolean {

        return this.activeLayerIds.indexOf(resourceId) > -1;
    }


    public toggleLayer(resourceId: string, mainTypeDocument: IdaiFieldDocument | undefined) {

        this.activeLayerIds = this.isActiveLayer(resourceId) ?
            ListUtil.remove(this.activeLayerIds, resourceId) :
            ListUtil.add(this.activeLayerIds, resourceId);

        if (mainTypeDocument) this.viewFacade.setActiveLayersIds(mainTypeDocument.resource.id as any, this.activeLayerIds);
    }


    private fetchActiveLayersFromResourcesState(mainTypeDocument: IdaiFieldDocument | undefined): ListDiffResult {

        const newActiveLayerIds = mainTypeDocument ?
            this.viewFacade.getActiveLayersIds(mainTypeDocument.resource.id as any) : [];
        const oldActiveLayerIds = this.activeLayerIds.slice(0);
        this.activeLayerIds = newActiveLayerIds;

        return {
            removed: ListUtil.subtract(oldActiveLayerIds, newActiveLayerIds),
            added: ListUtil.subtract(newActiveLayerIds, oldActiveLayerIds),
        };
    }
}