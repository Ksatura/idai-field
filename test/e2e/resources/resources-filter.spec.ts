import {browser, protractor} from 'protractor';
import {ResourcesPage} from './resources.page';
import {DoceditPage} from '../docedit/docedit.page';
import {SearchBarPage} from '../widgets/search-bar.page';
import {NavbarPage} from '../navbar.page';
import {DetailSidebarPage} from '../widgets/detail-sidebar.page';

let EC = protractor.ExpectedConditions;
let delays = require('../config/delays');


/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
describe('resources/filter --', () => {

    let index = 0;


    beforeAll(() => {

        ResourcesPage.get();
        browser.sleep(delays.shortRest);
    });


    beforeEach(() => {

        if (index > 0) {
            NavbarPage.performNavigateToSettings();
            require('request').post('http://localhost:3003/reset', {});
            browser.sleep(delays.shortRest);
            NavbarPage.clickNavigateToProject();
            browser.sleep(delays.shortRest * 4);
            NavbarPage.clickNavigateToExcavation();
        }
        index++;
    });


    it('select all filter', () => {

        ResourcesPage.performCreateResource('1', 'feature-architecture');
        ResourcesPage.performCreateResource('2', 'feature-floor');
        SearchBarPage.clickChooseTypeFilter('inscription');
        browser.wait(EC.stalenessOf(ResourcesPage.getListItemEl('1')), delays.ECWaitTime);
        browser.wait(EC.stalenessOf(ResourcesPage.getListItemEl('2')), delays.ECWaitTime);
        SearchBarPage.clickChooseTypeFilter('all');
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('1')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('2')), delays.ECWaitTime);
    });


    it('show only resources of the selected type', () => {

        ResourcesPage.performCreateResource('1', 'feature-architecture');
        ResourcesPage.performCreateResource('2', 'feature-floor');
        SearchBarPage.clickChooseTypeFilter('feature-floor');
        browser.wait(EC.stalenessOf(ResourcesPage.getListItemEl('1')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('2')), delays.ECWaitTime);
        SearchBarPage.clickChooseTypeFilter('feature-architecture');
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('1')), delays.ECWaitTime);
        browser.wait(EC.stalenessOf(ResourcesPage.getListItemEl('2')), delays.ECWaitTime);
    });


    xit('filter by parent type', () => {

        ResourcesPage.performCreateResource('1', 'feature-architecture');
        ResourcesPage.performCreateResource('2', 'inscription');
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('1')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('2')), delays.ECWaitTime);
        SearchBarPage.clickChooseTypeFilter('feature');
        browser.wait(EC.stalenessOf(ResourcesPage.getListItemEl('2')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('1')), delays.ECWaitTime);
    });


    xit('show correct types in plus type menu after choosing type filter', () => {

        const checkTypeOptions = () => {

            SearchBarPage.clickChooseTypeFilter('feature');
            ResourcesPage.clickCreateResource();
            browser.wait(EC.presenceOf(ResourcesPage.getResourceTypeOption('feature')), delays.ECWaitTime);
            browser.wait(EC.presenceOf(ResourcesPage.getResourceTypeOption('feature-architecture')), delays.ECWaitTime);
            browser.wait(EC.stalenessOf(ResourcesPage.getResourceTypeOption('inscription')), delays.ECWaitTime);
            browser.wait(EC.stalenessOf(ResourcesPage.getResourceTypeOption('processunit')), delays.ECWaitTime);
            browser.wait(EC.stalenessOf(ResourcesPage.getResourceTypeOption('processunit-drilling')), delays.ECWaitTime);
            browser.wait(EC.stalenessOf(ResourcesPage.getResourceTypeOption('wall_surface')), delays.ECWaitTime);
            browser.wait(EC.stalenessOf(ResourcesPage.getResourceTypeOption('find')), delays.ECWaitTime);
            browser.wait(EC.stalenessOf(ResourcesPage.getResourceTypeOption('find-glass')), delays.ECWaitTime);

            SearchBarPage.clickChooseTypeFilter('processunit');
            ResourcesPage.clickCreateResource();
            browser.wait(EC.presenceOf(ResourcesPage.getResourceTypeOption('processunit')), delays.ECWaitTime);
            browser.wait(EC.presenceOf(ResourcesPage.getResourceTypeOption('processunit-drilling')), delays.ECWaitTime);
            browser.wait(EC.stalenessOf(ResourcesPage.getResourceTypeOption('feature')), delays.ECWaitTime);
            browser.wait(EC.stalenessOf(ResourcesPage.getResourceTypeOption('feature-architecture')), delays.ECWaitTime);
            browser.wait(EC.stalenessOf(ResourcesPage.getResourceTypeOption('inscription')), delays.ECWaitTime);
            browser.wait(EC.stalenessOf(ResourcesPage.getResourceTypeOption('wall_surface')), delays.ECWaitTime);
            browser.wait(EC.stalenessOf(ResourcesPage.getResourceTypeOption('find')), delays.ECWaitTime);
            browser.wait(EC.stalenessOf(ResourcesPage.getResourceTypeOption('find-glass')), delays.ECWaitTime);

            SearchBarPage.clickChooseTypeFilter('all');
            ResourcesPage.clickCreateResource();
            browser.wait(EC.presenceOf(ResourcesPage.getResourceTypeOption('feature')), delays.ECWaitTime);
            browser.wait(EC.presenceOf(ResourcesPage.getResourceTypeOption('feature-architecture')), delays.ECWaitTime);
            browser.wait(EC.presenceOf(ResourcesPage.getResourceTypeOption('inscription')), delays.ECWaitTime);
            browser.wait(EC.presenceOf(ResourcesPage.getResourceTypeOption('processunit')), delays.ECWaitTime);
            browser.wait(EC.presenceOf(ResourcesPage.getResourceTypeOption('processunit-drilling')), delays.ECWaitTime);
            browser.wait(EC.presenceOf(ResourcesPage.getResourceTypeOption('wall_surface')), delays.ECWaitTime);
            browser.wait(EC.presenceOf(ResourcesPage.getResourceTypeOption('find')), delays.ECWaitTime);
            browser.wait(EC.presenceOf(ResourcesPage.getResourceTypeOption('find-glass')), delays.ECWaitTime);
        };

        checkTypeOptions();
        ResourcesPage.clickListModeButton();
        checkTypeOptions();
    });


    it('set type of newly created resource to filter type if a child type is chosen as filter type', () => {

        const checkTypeIcon = () => {

            SearchBarPage.clickChooseTypeFilter('feature-architecture');
            ResourcesPage.getCreateDocumentButtonTypeCharacter().then(character => expect(character).toEqual('A'));

            SearchBarPage.clickChooseTypeFilter('feature');
            browser.wait(EC.stalenessOf(ResourcesPage.getCreateDocumentButtonTypeIcon()), delays.ECWaitTime);

            SearchBarPage.clickChooseTypeFilter('all');
            browser.wait(EC.stalenessOf(ResourcesPage.getCreateDocumentButtonTypeIcon()), delays.ECWaitTime);
        };

        const createResourceWithPresetType = (identifier: string, selectGeometryType: boolean) => {

            SearchBarPage.clickChooseTypeFilter('feature-layer');
            ResourcesPage.getCreateDocumentButtonTypeCharacter().then(character => expect(character).toEqual('E'));
            ResourcesPage.clickCreateResource();
            if (selectGeometryType) ResourcesPage.clickSelectGeometryType();

            ResourcesPage.isListMode().then(function(isListMode) {
                if (isListMode) {
                    ResourcesPage.typeInNewResourceAndHitEnterInList(identifier);
                } else {
                    DoceditPage.typeInInputField('identifier', identifier);
                    ResourcesPage.scrollUp();
                    DoceditPage.clickSaveDocument();
                }
            });
         
            browser.sleep(delays.shortRest);
        };

        checkTypeIcon();
        createResourceWithPresetType('1', true);
        DetailSidebarPage.getTypeFromDocView().then(character => expect(character).toEqual('Erdbefund'));

        ResourcesPage.clickListModeButton();
        checkTypeIcon();
        createResourceWithPresetType('2', false);
        // TODO comment in ResourcesPage.getDocumentTeaserTypeCharacter().then(character => expect(character).toEqual('E'));
    });
});
