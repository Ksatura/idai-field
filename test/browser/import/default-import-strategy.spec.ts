import {DefaultImportStrategy} from "../../../app/import/default-import-strategy";
import {ImportStrategy} from "../../../app/import/import-strategy";


/**
 * @author Daniel de Oliveira
 */
export function main() {

    let mockValidator;
    let mockDatastore;
    let importStrategy: ImportStrategy;

    beforeEach(() => {
        mockDatastore = jasmine.createSpyObj('datastore', ['create']);
        mockValidator = jasmine.createSpyObj('validator', ['validate']);

        mockValidator.validate.and.callFake(function() {return Promise.resolve();});
        mockDatastore.create.and.callFake(function(a){return Promise.resolve(a)});

        importStrategy = new DefaultImportStrategy(mockValidator,mockDatastore);
    });

    describe('DefaultImportStrategy', () => {

        it('should resolve on success', (done) => {

            importStrategy.importDoc({resource:{type:undefined,id:undefined,relations:undefined}})
                .then(
                    () => done(),
                    () => { fail(); done() }
                )
        });

        it('should reject on err in validator', (done) => {

            mockValidator.validate.and.callFake(function() {return Promise.reject(['abc']);});
            importStrategy.importDoc({resource:{type:undefined,id:undefined,relations:undefined}})
                .then(
                    () => { fail(); done() },
                    err => {
                         expect(err[0]).toBe('abc');
                        done();
                    }
                )
        });

        it('should reject on err in datastore', (done) => {

            mockDatastore.create.and.callFake(function() {return Promise.reject(['abc']);});
            importStrategy.importDoc({resource:{type:undefined,id:undefined,relations:undefined}})
                .then(
                    () => done(),
                    err => {
                        expect(err[0]).toBe('abc');
                        done();
                    }
                )
        });
    })
}