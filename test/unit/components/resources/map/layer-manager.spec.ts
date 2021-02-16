import {ImageDocument} from 'idai-components-2';
import {LayerManager} from '../../../../../src/app/components/resources/map/map/layers/layer-manager';
import {Static} from '../../../static';


/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
describe('LayerManager', () => {

    let layerManager: LayerManager;

    const layerDocuments: Array<ImageDocument> = [
        Static.doc('Layer 1', 'layer1', 'Image', 'l1') as ImageDocument,
        Static.doc('Layer 2', 'layer2', 'Image', 'l2') as ImageDocument,
    ];

    const projectDocument: any = {
        resource: {
            id: 'project',
            relations: {
                hasLayer: ['l1', 'l2'],
            }
        }
    };

    let mockViewFacade;


    beforeEach(() => {

        const mockDatastore = jasmine.createSpyObj('datastore', ['getMultiple', 'get']);
        mockDatastore.getMultiple.and.returnValue(Promise.resolve(layerDocuments));
        mockDatastore.get.and.returnValue(Promise.resolve(projectDocument));

        mockViewFacade = jasmine.createSpyObj('viewFacade',
            ['getActiveLayersIds', 'setActiveLayersIds', 'getCurrentOperation']);
        mockViewFacade.getActiveLayersIds.and.returnValue([]);

        layerManager = new LayerManager(mockDatastore, mockDatastore, mockViewFacade, undefined);
    });


    it('initialize layers', async done => {

        const activeLayersChange = await layerManager.initializeLayers();

        expect(layerManager.getLayerGroups().length).toBe(1);
        expect(layerManager.getLayerGroups()[0].layers[0].resource.id).toEqual('l1');
        expect(layerManager.getLayerGroups()[0].layers[1].resource.id).toEqual('l2');

        expect(activeLayersChange.added.length).toBe(0);
        expect(activeLayersChange.removed.length).toBe(0);

        done();
    });


    it('restore active layers from resources state', async done => {

        mockViewFacade.getActiveLayersIds.and.returnValue(['l2']);

        const activeLayersChange = await layerManager.initializeLayers();

        expect(activeLayersChange.added.length).toBe(1);
        expect(activeLayersChange.added[0]).toEqual('l2');
        expect(activeLayersChange.removed.length).toBe(0);

        done();
    });


    it('add and remove correct layers when initializing with different resources states',
            async done => {

        mockViewFacade.getActiveLayersIds.and.returnValue(['l2']);

        await layerManager.initializeLayers();

        mockViewFacade.getActiveLayersIds.and.returnValue(['l1']);

        const activeLayersChange = await layerManager.initializeLayers();

        expect(activeLayersChange.added.length).toBe(1);
        expect(activeLayersChange.added[0]).toEqual('l1');
        expect(activeLayersChange.removed.length).toBe(1);
        expect(activeLayersChange.removed[0]).toEqual('l2');

        done();
    });


    it('add or remove no layers if the layers are initialized with the same resources state again',
        async done => {

            mockViewFacade.getActiveLayersIds.and.returnValue(['l2']);

            await layerManager.initializeLayers();
            const activeLayersChange = await layerManager.initializeLayers();

            expect(activeLayersChange.added.length).toBe(0);
            expect(activeLayersChange.removed.length).toBe(0);

            done();
        });
});
