import {buildImportCatalogFunction} from '../../../../../src/app/core/import/import/import-catalog';
import {createLookup} from '../../../test-helpers';
import {DatastoreErrors} from '../../../../../src/app/core/datastore/model/datastore-errors';

describe('importCatalog', () => {

    it('base case', async done => {

        const datastore = jasmine.createSpyObj('datastore', ['create', 'update', 'get']);
        let called = false;
        datastore.get.and.callFake(() => { throw [DatastoreErrors.DOCUMENT_NOT_FOUND] });
        datastore.create.and.callFake(document => {
            expect(document.resource.id).toBe('tc1');
            called = true;
        });
        const username = 'testuser';
        const selectedProject = 'test';
        const importCatalog = buildImportCatalogFunction(datastore, {username, selectedProject});

        const documentsLookup = createLookup([['tc1', 'TypeCatalog']]);
        await importCatalog([documentsLookup['tc1']]);

        expect(called).toBeTruthy();
        done();
    });
    // fit('do not overwrite existing relations to find', () => {
});
