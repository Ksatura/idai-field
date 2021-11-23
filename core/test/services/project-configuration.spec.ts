import { sameset } from 'tsfun';
import { CategoryForm } from '../../src/model/configuration/category-form';
import { ProjectConfiguration } from '../../src/services/project-configuration';
import { Forest, Named } from '../../src/tools';


describe('ProjectConfiguration', () => {

    const projectConfiguration = new ProjectConfiguration({
        forms: Forest.build([
            [
                { name: 'Image' },
                [
                    [
                        { name: 'Drawing' },
                        []
                    ]
                ]
            ],
            [
                { name: 'Operation' },
                [
                    [
                        { name: 'Trench' },
                        []
                    ]
                ]
            ],
            [
                { name: 'Place' },
                []
            ],
            [
                { name: 'Inscription' },
                []
            ],
            [
                { name: 'Type' },
                []
            ],
            [
                { name: 'TypeCatalog' },
                []
            ],
            [
                { name: 'Project' },
                []
            ],
            [
                { name: 'Find' },
                []
            ],
            [
                { name: 'Feature' },
                [
                    [
                        { name: 'Architecture' },
                        []
                    ]
                ]
            ]
        ]) as Forest<CategoryForm>,
        categories: {},
        relations: [],
        commonFields: {}
    });


    it('isGeometryCategory', () => {

        expect(projectConfiguration.isGeometryCategory('Image')).toBeFalsy();
        expect(projectConfiguration.isGeometryCategory('Drawing')).toBeFalsy();
        expect(projectConfiguration.isGeometryCategory('Type')).toBeFalsy();
        expect(projectConfiguration.isGeometryCategory('TypeCatalog')).toBeFalsy();
        expect(projectConfiguration.isGeometryCategory('Inscription')).toBeFalsy();
        expect(projectConfiguration.isGeometryCategory('Project')).toBeFalsy();
        expect(projectConfiguration.isGeometryCategory('Operation')).toBeTruthy();
        expect(projectConfiguration.isGeometryCategory('Project')).toBeFalsy();
    });


    it('getFieldCategories', () => {

        expect(
            sameset(
                projectConfiguration.getFieldCategories().map(Named.toName),
                ['Operation', 'Trench', 'Inscription', 'Type', 'TypeCatalog', 'Find', 'Place', 'Feature', 'Architecture'])
        ).toBeTruthy();
    });


    it('getConcreteFieldCategories', () => {

        expect(
            sameset(
                projectConfiguration.getConcreteFieldCategories().map(Named.toName),
                ['Operation', 'Trench', 'Inscription', 'Find', 'Place', 'Feature', 'Architecture'])
        ).toBeTruthy();
    });


    it('getRegularCategoryNames', () => {

        expect(
            sameset(
                projectConfiguration.getRegularCategories().map(Named.toName),
                ['Inscription', 'Find', 'Feature', 'Architecture'])
        ).toBeTruthy();
    });


    it('getImageCategoryNames', () => {

        expect(
            sameset(
                projectConfiguration.getImageCategories().map(Named.toName),
                ['Image', 'Drawing'])
        ).toBeTruthy();
    });


    it('getTypeCategories', () => {

        expect(
            sameset(
                projectConfiguration.getTypeCategories().map(Named.toName),
                ['TypeCatalog', 'Type'])
        ).toBeTruthy();
    });


    it('getOverviewToplevelCategories', () => {

        expect(
            sameset(
                projectConfiguration.getOverviewToplevelCategories().map(Named.toName),
                ['Operation', 'Place'])
        ).toBeTruthy();
    });


    it('getOverviewConcreteOverviewCategories', () => {

        expect(
            sameset(
                projectConfiguration.getConreteOverviewCategories().map(Named.toName),
                ['Trench', 'Place'])
        ).toBeTruthy();
    });


    it('getOverviewCategories', () => {

        expect(
            sameset(
                projectConfiguration.getOverviewCategories().map(Named.toName),
                ['Operation', 'Trench', 'Place'])
        ).toBeTruthy();
    });


    it('getFeatureCategories', () => {

        expect(
            sameset(
                projectConfiguration.getFeatureCategories().map(Named.toName),
                ['Feature', 'Architecture'])
        ).toBeTruthy();
    });
});
