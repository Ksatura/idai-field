import {browser, protractor, by} from 'protractor';
import {ImageOverviewPage} from './image-overview.page';
import {NavbarPage} from "../navbar.page";
import {DetailSidebarPage} from '../widgets/detail-sidebar.page';
import {FieldsViewPage} from '../widgets/fields-view-page';
import {SearchBarPage} from '../widgets/search-bar.page';
const request = require('request');

const path = require('path');

const EC = protractor.ExpectedConditions;
const delays = require('../config/delays');

fdescribe('images/image-overview --', function() {


    const resourceId1 = 'tf1';
    const resourceId2 = 'c1';

    function createTwo() {

        ImageOverviewPage.createDepictsRelation('testf1');
        ImageOverviewPage.createDepictsRelation('context1');
    }

    function expectLinkBadgePresence(toBeTruthy: boolean, nrBadges: number = 1) {

        _expectLinkBadgePresence(toBeTruthy, resourceId1);
        if (nrBadges == 2) _expectLinkBadgePresence(toBeTruthy, resourceId2);
    }

    function _expectLinkBadgePresence(toBeTruthy, relatedResourceId) {

        const exp = expect(ImageOverviewPage.getCell(0)
            .all(by.id('related-resource-'+relatedResourceId))
            .first().isPresent());

        if (toBeTruthy) exp.toBeTruthy();
        else exp.toBeFalsy();
    }


    function unlink() {

        ImageOverviewPage.getCell(0).click();
        ImageOverviewPage.clickUnlinkButton();
        ImageOverviewPage.clickConfirmUnlinkButton();
        browser.sleep(delays.shortRest);
    }


    beforeAll(() => {

        ImageOverviewPage.getAndWaitForImageCells();
        browser.sleep(delays.shortRest * 3);
    });

    let i = 0;


    beforeEach(() => {

        if (i > 0) {
            NavbarPage.performNavigateToSettings();
            request.post('http://localhost:3003/reset', {});
            browser.sleep(delays.shortRest * 3);
            NavbarPage.clickNavigateToImages();
            ImageOverviewPage.waitForCells();
            browser.sleep(delays.shortRest);
        }
        i++;
    });


    it('deselect cells', () => {

        ImageOverviewPage.getAllCells().then(function(cells) {
            const first = 0;
            const last = cells.length - 1;

            cells[first].click();
            expect(cells[first].getAttribute('class')).toMatch(ImageOverviewPage.selectedClass);
            cells[first].click();
            expect(cells[first].getAttribute('class')).not.toMatch(ImageOverviewPage.selectedClass);
            if (last != first) {
                cells[last].click();
                expect(cells[last].getAttribute('class')).toMatch(ImageOverviewPage.selectedClass);
                cells[last].click();
                expect(cells[last].getAttribute('class')).not.toMatch(ImageOverviewPage.selectedClass);

                if (last > 1) {
                    const middle = Math.floor(0.5 * (cells.length));
                    cells[middle].click();
                    expect(cells[middle].getAttribute('class')).toMatch(ImageOverviewPage.selectedClass);
                    cells[middle].click();
                    expect(cells[middle].getAttribute('class')).not.toMatch(ImageOverviewPage.selectedClass)
                }
            }
        });
    });


    it('deselect images by clicking the corresponding button', () => {

        ImageOverviewPage.clickCell(0);
        expect(ImageOverviewPage.getCell(0).getAttribute('class')).toMatch(ImageOverviewPage.selectedClass);
        ImageOverviewPage.clickDeselectButton();
        expect(ImageOverviewPage.getCell(0).getAttribute('class')).not.toMatch(ImageOverviewPage.selectedClass);
    });


    it('navigate from overview to view, and back to overview', async done => {

        const imageName = await ImageOverviewPage.getCellImageName(0);

        ImageOverviewPage.doubleClickCell(0);
        browser.wait(EC.presenceOf(DetailSidebarPage.getDocumentCard()), delays.ECWaitTime);
        FieldsViewPage.clickFieldsTab();
        DetailSidebarPage.getIdentifier()
            .then(identifier => expect(identifier).toContain(imageName));

        DetailSidebarPage.clickBackToGridButton();
        browser.wait(EC.presenceOf(ImageOverviewPage.getCell(0)), delays.ECWaitTime);
        ImageOverviewPage.getCellImageName(0).then(name => expect(name).toContain(imageName));
        done();
    });


    it('link: link an image to a resource', () => {

        ImageOverviewPage.createDepictsRelation('testf1');
        expectLinkBadgePresence(true);
    });


    it('link: link two images to a resource', () => {

        createTwo();
        expectLinkBadgePresence(true, 2);
        browser.sleep(delays.shortRest);
    });


    it('link: unlink an image from a resource', () => {

        ImageOverviewPage.createDepictsRelation('testf1');
        unlink();
        browser.sleep(delays.shortRest);
        expectLinkBadgePresence(false);
    });


    it('link: unlink two images from a resource', () => {

        createTwo();
        unlink();
        browser.sleep(delays.shortRest);
        expectLinkBadgePresence(false, 2);
    });


    it('link: use main type document filter', () => {

        ImageOverviewPage.createDepictsRelation('testf1');

        ImageOverviewPage.clickSelectMainTypeDocumentFilterOption(1);
        browser.wait(EC.presenceOf(ImageOverviewPage.getCellByIdentifier('PE07-So-07_Z001.jpg')),
            delays.ECWaitTime);
        browser.wait(EC.stalenessOf(ImageOverviewPage.getCellByIdentifier('mapLayerTest2.png')),
            delays.ECWaitTime);

        ImageOverviewPage.clickSelectMainTypeDocumentFilterOption(2);
        browser.wait(EC.stalenessOf(ImageOverviewPage.getCellByIdentifier('PE07-So-07_Z001.jpg')),
            delays.ECWaitTime);
        browser.wait(EC.presenceOf(ImageOverviewPage.getCellByIdentifier('mapLayerTest2.png')),
            delays.ECWaitTime);

        ImageOverviewPage.clickSelectMainTypeDocumentFilterOption(0);
        browser.wait(EC.presenceOf(ImageOverviewPage.getCellByIdentifier('PE07-So-07_Z001.jpg')),
            delays.ECWaitTime);
        browser.wait(EC.presenceOf(ImageOverviewPage.getCellByIdentifier('mapLayerTest2.png')),
            delays.ECWaitTime);
    });


    it('link: filter types in overview', async done => {

        ImageOverviewPage.clickCell(0);
        ImageOverviewPage.clickLinkButton();
        ImageOverviewPage.getLinkModalListEntries().then(esBefore => expect(esBefore.length).toBeGreaterThan(2));
        SearchBarPage.clickChooseTypeFilter('operation-trench');
        ImageOverviewPage.getLinkModalListEntries().then(esAfter => expect(esAfter.length).toBe(2));
        done();
    });
});