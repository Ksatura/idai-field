import Ajv from 'ajv';
import { IdGenerator, PouchdbDatastore, ImageStore } from 'idai-field-core';
import { ExpressServer } from '../../../src/app/services/express-server';
import { FsAdapter } from '../../../src/app/services/imagestore/fs-adapter';
import { ThumbnailGenerator } from '../../../src/app/services/imagestore/thumbnail-generator';
// Not explicitely exported by idai-field-core, because it is only used for tests.
import schema from '../../../../core/api-schemas/files-list.json';

const fs = require('fs');
const request = typeof window !== 'undefined' ? window.require('supertest') : require('supertest');


describe('ExpressServer', () => {

    const testFilePath = process.cwd() + '/test/test-temp/';
    const testProjectName = 'test_tmp_project';
    const password = 'pw';
    const ajv = new Ajv();
    const validate = ajv.compile(schema);

    const mockImage: Buffer = fs.readFileSync( process.cwd() + '/test/test-data/logo.png');

    let expressMainApp: any;
    let expressFauxtonApp: any;
    let pouchdbDatastore: PouchdbDatastore;
    let imageStore: ImageStore;


    beforeAll(async done => {

        fs.mkdirSync(testFilePath, { recursive: true });

        imageStore = new ImageStore(new FsAdapter(), new ThumbnailGenerator());

        const expressServer = new ExpressServer(imageStore);
        expressServer.setPassword(password);

        [expressMainApp, expressFauxtonApp] = await expressServer.setupServer(testFilePath);

        const PouchDB = expressServer.getPouchDB();

        pouchdbDatastore = new PouchdbDatastore(
            (name: string) => new PouchDB(name),
            new IdGenerator()
        );

        await pouchdbDatastore.createEmptyDb(testProjectName);

        done();
    });


    // Re-initialize image store data for each test.
    beforeEach(async (done) => {
        await imageStore.init(`${testFilePath}imagestore/`, testProjectName);
        done();
    });


    afterEach(async (done) => {
        await imageStore.deleteData(testProjectName);
        done();
    });

    
    afterAll(async (done) => {

        await pouchdbDatastore.destroyDb(testProjectName);

        await new Promise<void>((resolve) => {
            expressMainApp.close(resolve);
        });

        await new Promise<void>((resolve) => {
            expressFauxtonApp.close(resolve);
        });

        fs.rmSync(testFilePath, { recursive: true });
        done();
    });


    it('/files/:project without credentials returns 401', async done => {

        request(expressMainApp)
            .get('/files/test_tmp_project')
            .set('Content-Type', 'application/json')
            .expect(401)
            .end((err: Error, res: any) => {
                if (err) fail(err);
                done();
            });
    });


    it('/files/:project returns an empty index', async done => {

        try {
            const response = await request(expressMainApp)
                .get('/files/test_tmp_project')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Basic ${btoa(testProjectName + ':' + password)}`)
                .expect(200);

            // Body should be {}
            expect(Object.keys(response.body).length).toBe(0);
            expect(validate(response.body)).toBe(true);

            done();
        } catch (e) {
            fail(e);
        }
    });


    it('/files/:project returns an index of previously stored images', async done => {

        try {
            const uuids = ['1', '2'];

            for (const uuid of uuids) {
                await request(expressMainApp)
                    .put(`/files/test_tmp_project/${uuid}`)
                    .send(mockImage)
                    .set('Content-Type', 'image/x-www-form-urlencoded')
                    .set('Authorization', `Basic ${btoa(testProjectName + ':' + password)}`)
                    .expect(200);
            }

            const response = await request(expressMainApp)
                .get('/files/test_tmp_project')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Basic ${btoa(testProjectName + ':' + password)}`)
                .expect(200);

            expect(Object.keys(response.body).length).toBe(2);
            expect(validate(response.body)).toBe(true);

            done();
        } catch (e) {
            fail(e);
        }
    });

    it('/files/:project returns previously deleted images marked as deleted', async (done) => {

        try {
            const uuids = ['1', '2', '3'];
            for (const uuid of ['1', '2', '3']) {
                await request(expressMainApp)
                    .put(`/files/test_tmp_project/${uuid}?type:original_image`)
                    .send(mockImage)
                    .set('Content-Type', 'image/x-www-form-urlencoded')
                    .set('Authorization', `Basic ${btoa(testProjectName + ':' + password)}`)
                    .expect(200);
            }

            await request(expressMainApp)
                .delete(`/files/test_tmp_project/${uuids[0]}`)
                .send(mockImage)
                .set('Content-Type', 'image/x-www-form-urlencoded')
                .set('Authorization', `Basic ${btoa(testProjectName + ':' + password)}`)
                .expect(200);

            const response = await request(expressMainApp)
                .get('/files/test_tmp_project')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Basic ${btoa(testProjectName + ':' + password)}`)
                .expect(200);

            expect(Object.keys(response.body).length).toBe(3);
            expect(response.body[uuids[0]].deleted).toBe(true);
            expect(response.body[uuids[1]].deleted).toBe(false);
            expect(response.body[uuids[2]].deleted).toBe(false);
            expect(validate(response.body)).toBe(true);

            done();
        } catch (e) {
            fail(e);
        }
    });
});
