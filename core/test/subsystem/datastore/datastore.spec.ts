import { doc, doc1 } from '../../test-helpers';
import { CoreApp, createCoreApp, createHelpers } from '../subsystem-helper';


describe('subsystem/datastore', () => {

    let app: CoreApp;

    let helpers;

    let image0;
    let trench0;
    
    beforeEach(async done => {

        try {
            app = await createCoreApp();
            helpers = await createHelpers(app);
        } catch (err) {
            console.error(err);
        }
        done();
    });


    it('hi', async done => {

        await app.datastore.create(doc1('abc', 'Abc', 'Trench'));

        await helpers.expectDocuments('abc');
        done();
    });


    it('DocumentDatastore - do not throw and return everything with all categories', async done => {

        image0 = doc('Image', 'Image', 'Image', 'image0');
        trench0 = doc('Trench', 'Trench', 'Trench', 'trench0');

        await app.datastore.create(image0);
        await app.datastore.create(trench0);

        try {
            const result = await app.datastore.find({ categories: ['Trench', 'Image'] });
            expect(result.documents.length).toBe(2);
        } catch (err) {
            fail(err);
        }
        done();
    });


    it('DocumentDatastore - return everything when called without categories', async done => {

        image0 = doc('Image', 'Image', 'Image', 'image0');
        trench0 = doc('Trench', 'Trench', 'Trench', 'trench0');

        await app.datastore.create(image0);
        await app.datastore.create(trench0);

        try {
            const result = await app.datastore.find({});
            expect(result.documents.length).toBe(2);
        } catch (err) {
            fail(err);
        }
        done();
    });


    it('sort mode', async done => {

        const doc1 = doc('sd1', 'A-B-100', 'Find', '1');
        const doc2 = doc('sd2', 'B-100', 'Find', '2');
        const doc3 = doc('sd3', 'C-100', 'Find', '3');

        await app.datastore.create(doc1);
        await app.datastore.create(doc2);
        await app.datastore.create(doc3);

        const { documents: documents1, totalCount: totalCount1 } =
            await app.datastore.find({ q: 'B-100', sort: { mode: 'default' }});

        expect(documents1.length).toBe(2);
        expect(totalCount1).toBe(2);

        expect(documents1[0].resource.id).toBe('1');
        expect(documents1[1].resource.id).toBe('2');

        const { documents: documents2, totalCount: totalCount2 } =
            await app.datastore.find({ q: 'B-100', sort: { mode: 'exactMatchFirst' }});

        expect(documents2.length).toBe(2);
        expect(totalCount2).toBe(2);

        expect(documents2[0].resource.id).toBe('2');
        expect(documents2[1].resource.id).toBe('1');
        done();
    });


    it('isChildOf', async done => {

        await helpers.createDocuments([
            ['id1', 'Trench', ['id2']],
            ['id2', 'Feature', ['id3']],
            ['id3', 'Find', []],
        ]);

        const result = await app.datastore.find({ 
            constraints: { 'isChildOf:contain': { value: ['id1'], searchRecursively: true }}});
        expect(result.ids).toEqual(['id2', 'id3']);
        done();
    });
});
