import { Map } from 'tsfun';
import { addRelations } from '../../../src/configuration/boot/add-relations';
import { TransientFormDefinition } from '../../../src/configuration/model/form/transient-form-definition';
import { Relation } from '../../../src/model/configuration/relation';


/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
describe('addRelations', () => {

    let forms: Map<TransientFormDefinition>;
    let t1: TransientFormDefinition;

    beforeEach(() => {

        t1 = {
            name: 'T1:default',
            categoryName: 'T1',
            description: {},
            createdBy: '',
            creationDate: '',
            fields: {},
            groups: []
        };

        forms = { 'T1': t1 };
    });


    it('add a relation', () => {

        const relation: Relation = {
            name: 'R',
            domain: ['domainA'],
            range : ['rangeA'],
            editable: false,
            inputType: 'relation'
        };

        const [, relations] = addRelations([relation])([forms, []]);

        expect(relations[0].name).toBe('R');
        expect(relations[1]).toBe(undefined); // to prevent reintroducing bug
    });


    it('overwrite relation for a part of a domain', () => {

        const r1: Relation = {
            name: 'R',
            domain: ['domainA', 'domainB', 'domainC'],
            range : ['rangeA'],
            editable: false,
            inputType: 'relation'
        };

        const r2: Relation = {
            name: 'R',
            domain: ['domainB', 'domainC'],
            range : ['rangeB'],
            editable: false,
            inputType: 'relation'
        };

        const [, relations] = addRelations([r1, r2])([forms, []]);
        expect(relations[0].domain).toContain('domainB');
        expect(relations[0].domain).toContain('domainC');
        expect(relations[0].range).toContain('rangeB');

        expect(relations[1].domain).toContain('domainA');
        expect(relations[1].range).toContain('rangeA');
    });


    it('overwrite relation with inheritance for a part of a domain', () => {

        const r1: Relation = {
            name: 'R',
            domain: ['T1:inherit'],
            range : ['rangeA'],
            editable: false,
            inputType: 'relation'
        };

        const r2: Relation = {
            name: 'R',
            domain: ['T1:inherit'],
            range: ['rangeA', 'rangeB', 'rangeC'],
            editable: false,
            inputType: 'relation'
        };

        const [, relations] = addRelations([r1, r2])([forms, []]);

        expect(relations.length).toEqual(1); // to make sure the relation is collapsed into one
        expect(relations[0].range).toContain('rangeA');
        expect(relations[0].range).toContain('rangeB');
        expect(relations[0].range).toContain('rangeC');
    });


    it('replace empty range with all categories except the domain categories', () => {

        const r: Relation = {
            name: 'R',
            domain: ['T2', 'T3'],
            range: [],
            editable: false,
            inputType: 'relation'
        };

        const [, relations] = addRelations([r])([forms, []]);

        expect(relations[0].range[0]).toBe('T1');
        expect(relations[0].range[1]).toBe(undefined);
    });


    it('replace domain ALL with all categories except the range categories', () => {

        const r: Relation = {
            name: 'R',
            domain: [],
            range: ['T2', 'T3'],
            editable: false,
            inputType: 'relation'
        };

        const [, relations] = addRelations([r])([forms, []]);

        expect(relations[0].domain[0]).toBe('T1');
        expect(relations[0].domain[1]).toBe(undefined);
    });


    it('replace range :inherit with all subcategories', () => {

        const r: Relation = { name: 'R',
            domain: [ 'T3' ],
            range: [ 'T1:inherit' ],
            editable: false,
            inputType: 'relation'
        };

        forms['T2'] = {
            name: 'T2:default',
            categoryName: 'T2',
            parent: 'T1',
            description: {},
            createdBy: '',
            creationDate: '',
            fields: {},
            groups: []
        };

        forms['T3'] = {
            name: 'T3:default',
            categoryName: 'T3',
            parent: 'T1',
            description: {},
            createdBy: '',
            creationDate: '',
            fields: {},
            groups: []
        };

        const [, relations] = addRelations([r])([forms, []]);

        expect(relations[0].range.indexOf('T1')).not.toBe(-1);
        expect(relations[0].range.indexOf('T2')).not.toBe(-1);
        expect(relations[0].range.indexOf('T1:inherit')).toBe(-1);
        expect(relations[0].domain[0]).toBe('T3');
    });


    it('replace domain :inherit with all subcategories', () => {

        const r: Relation = {
            name: 'R',
            domain: ['T1:inherit'],
            range: ['T3'],
            editable: false,
            inputType: 'relation'
        };

        forms['T2'] = {
            name: 'T2:default',
            categoryName: 'T2',
            parent: 'T1',
            description: {},
            createdBy: '',
            creationDate: '',
            fields: {},
            groups: []
        };

        forms['T3'] = {
            name: 'T3:default',
            categoryName: 'T3',
            parent: 'T1',
            description: {},
            createdBy: '',
            creationDate: '',
            fields: {},
            groups: []
        };

        const [, relations] = addRelations([r])([forms, []]);

        expect(relations[0].domain.indexOf('T1')).not.toBe(-1);
        expect(relations[0].domain.indexOf('T2')).not.toBe(-1);
        expect(relations[0].domain.indexOf('T1:inherit')).toBe(-1);
        expect(relations[0].range[0]).toBe('T3');
    });


    // This test can detect problems coming from a wrong order of expandInherits and expandAllMarker calls
    it('exclude the category and subcategories when using :inherit and total range', () => {

        const r: Relation = {
            name: 'R',
            domain: ['T1:inherit'],
            range: [],
            editable: false,
            inputType: 'relation'
        };

        forms['T2'] = {
            name: 'T2:default',
            categoryName: 'T2',
            parent: 'T1',
            description: {},
            createdBy: '',
            creationDate: '',
            fields: {},
            groups: []
        };

        forms['T3'] = {
            name: 'T3:default',
            categoryName: 'T3',
            description: {},
            createdBy: '',
            creationDate: '',
            fields: {},
            groups: []
        };
        const [, relations] = addRelations([r])([forms, []]);

        expect(relations[0].range[0]).toBe('T3');
        expect(relations[0].range.indexOf('T1')).toBe(-1);
        expect(relations[0].range.indexOf('T2')).toBe(-1);
    });
});
