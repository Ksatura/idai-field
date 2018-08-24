import {browser, by, element, protractor} from 'protractor';
import {ImportPage} from './import.page';
import {ResourcesPage} from '../resources/resources.page';
import {NavbarPage} from '../navbar.page';
import {OperationBarPage} from '../operation-bar.page';

const common = require('../common.js');
const delays = require('../config/delays');
const EC = protractor.ExpectedConditions;

/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
xdescribe('import --', function() {

    let index = 0;


    beforeAll(function() {

        ImportPage.get();
    });


    beforeEach(async done => {

        if (index > 0) {
            NavbarPage.performNavigateToSettings();
            await common.resetApp();
            browser.sleep(delays.shortRest);
            NavbarPage.clickNavigateToProject();
            browser.sleep(delays.shortRest * 4);
            NavbarPage.performNavigateToImport();
        }

        index++;
        done();
    });


    let importIt = function(url, mainTypeDocumentOption = 0) {

        expect(ImportPage.getSourceOptionValue(1)).toEqual('http');
        ImportPage.clickSourceOption(1);
        expect(ImportPage.getFormatOptionValue(0)).toEqual('native');
        ImportPage.clickFormatOption(0);
        ImportPage.clickMainTypeDocumentOption(mainTypeDocumentOption);
        common.typeIn(ImportPage.getImportURLInput(), url);
        ImportPage.clickStartImportButton();
    };


    xit('delete already imported iDAI.field documents if an error occurs', () => {

        importIt('./test/test-data/importer-test-constraint-violation.jsonl');

        NavbarPage.awaitAlert('existiert bereits', false);
        element(by.css('.alert button')).click();
        NavbarPage.clickNavigateToExcavation();

        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('SE0')), delays.ECWaitTime);

        ResourcesPage.getListItemIdentifierText(0).then(text => expect(text).not.toEqual('obob1'));
        ResourcesPage.getListItemIdentifierText(0).then(text => expect(text).not.toEqual('obob2'));
    });


    it('import a valid iDAI.field JSONL file via HTTP', () => {

        importIt('./test/test-data/importer-test-ok.jsonl');
        browser.sleep(delays.shortRest * 4);
        NavbarPage.clickNavigateToExcavation();
        OperationBarPage.performSelectOperation(0);

        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('obob1')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('obob2')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('obob3')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('obob4')), delays.ECWaitTime);
    });


    it('abort if an empty geometry is found', () => {

        importIt('./test/test-data/importer-test-empty-geometry.jsonl');
        NavbarPage.awaitAlert('nicht definiert', false);
    });


    it('abort if a geometry with invalid coordinates is found', () => {

        importIt('./test/test-data/importer-test-invalid-geometry-coordinates.jsonl');
        NavbarPage.awaitAlert('sind nicht valide', false);
    });


    it('abort if a geometry with an unsupported type is found', () => {

        importIt('./test/test-data/importer-test-unsupported-geometry-type.jsonl');
        NavbarPage.awaitAlert('nicht unterstützt', false);
    });


    it('link imported resources to an existing main type resource', () => {

        importIt('./test/test-data/importer-test-no-trench.jsonl', 1);

        browser.sleep(delays.shortRest);
        NavbarPage.clickNavigateToExcavation();

        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('obob1')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('obob2')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('obob3')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(ResourcesPage.getListItemEl('obob4')), delays.ECWaitTime);
    });


    it('abort if a resource must not be linked to an existing main type resource', () => {

        importIt('./test/test-data/importer-test-ok.jsonl', 1);
        NavbarPage.awaitAlert('nicht zugeordnet werden', false);
    });
});
