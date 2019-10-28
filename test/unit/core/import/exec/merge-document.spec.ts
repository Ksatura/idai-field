/**
 * @author Daniel de Oliveira
 */
import {Document} from 'idai-components-2';
import {mergeDocument} from '../../../../../app/core/import/exec/process/merge-document';


describe('mergeDocument', () => {

    const target: Document = {
        _id: 'id1',
        modified: [],
        created: undefined,
        resource: {
            id: 'id1',
            type: 'Object',
            identifier: 'identifier1',
            shortDescription: 'shortDescription1',
            anotherField: 'field1',
            relations: {}
        }
    };


    it('overwrite fields', () => {

        const source = {
            _id: 'id1',
            modified: [],
            created: undefined,
            resource: {
                id: 'id1',
                type: 'Object',
                identifier: 'identifier1',
                shortDescription: 'shortDescription2',
                anotherField: 'field2',
                relations: {}
            }
        };

        const result = mergeDocument(target, source, false);
        expect(result.resource.shortDescription).toEqual('shortDescription2');
        expect(result.resource.anotherField).toEqual('field2');
    });


    it('dont overwrite identifier, id, relations', () => {

        const source = {
            _id: 'id2',
            modified: [],
            created: undefined,
            resource: {
                id: 'id2',
                type: 'Object',
                identifier: 'identifier2',
                shortDescription: 'shortDescription2',
                anotherField: 'field2',
                relations: {dde: []}
            }
        };

        const result = mergeDocument(target, source, false);
        expect(result.resource.identifier).toEqual('identifier1');
        expect(result.resource.id).toEqual('id1');
        expect(result.resource.relations).toEqual({});
    });
});