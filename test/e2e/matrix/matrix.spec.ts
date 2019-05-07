import {browser, protractor} from 'protractor';
import {NavbarPage} from '../navbar.page';
import {MenuPage} from '../menu.page';
import {MatrixPage} from './matrix.page';
import {DoceditPage} from '../docedit/docedit.page';
import {DoceditRelationsTabPage} from '../docedit/docedit-relations-tab.page';

const EC = protractor.ExpectedConditions;
const delays = require('../config/delays');
const common = require('../common');


/**
 * @author Thomas Kleinke
 */
describe('matrix --', () => {

    let i = 0;


    beforeAll(async done => {

        MatrixPage.get();
        MatrixPage.performSelectOperation(1);
        done();
    });


    beforeEach(async done => {

        if (i > 0) {
            MenuPage.navigateToSettings();
            await common.resetApp();
            browser.sleep(delays.shortRest);
            NavbarPage.clickCloseNonResourcesTab();
            // NavbarPage.clickTab('project');
            // ResourcesPage.performJumpToMatrixView('S2');
            MatrixPage.get();
            MatrixPage.performSelectOperation(1);
        }

        i++;

        browser.wait(EC.presenceOf(MatrixPage.getSvgRoot()), delays.ECWaitTime);

        done();
    });


    function testDefaultMatrix() {

        MatrixPage.getNodes().then(nodes => expect(nodes.length).toBe(6));
        for (let i = 1; i <= 6; i++) {
            browser.wait(EC.presenceOf(MatrixPage.getNode('si' + i)), delays.ECWaitTime);
        }

        MatrixPage.getEdges().then(edges => expect(edges.length).toBe(5));
        browser.wait(EC.presenceOf(MatrixPage.getAboveEdge('si1', 'si2')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(MatrixPage.getAboveEdge('si1', 'si5')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(MatrixPage.getAboveEdge('si2', 'si3')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(MatrixPage.getAboveEdge('si3', 'si4')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(MatrixPage.getSameRankEdge('si3', 'si5')),
            delays.ECWaitTime);
    }


    it('edit relations and show updated matrix', () => {

        MatrixPage.clickNode('si1');
        DoceditPage.clickGotoTimeTab();
        DoceditRelationsTabPage.clickRelationDeleteButtonByIndices(2, 1);

        DoceditRelationsTabPage.clickAddRelationForGroupWithIndex(2);
        DoceditRelationsTabPage.typeInRelationByIndices(2, 1, 'SE4');
        DoceditRelationsTabPage.clickChooseRelationSuggestion(2, 1, 0);
        DoceditPage.clickSaveDocument();

        browser.wait(EC.stalenessOf(MatrixPage.getAboveEdge('si1', 'si5')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(MatrixPage.getAboveEdge('si1', 'si4')), delays.ECWaitTime);
    });


    it('select and deselect resources', () => {

        MatrixPage.clickSingleSelectionModeButton();
        MatrixPage.clickNode('si1');
        MatrixPage.clickNode('si2');
        MatrixPage.clickNode('si3');
        MatrixPage.getSelectedNodes().then(selected => expect(selected.length).toBe(3));

        MatrixPage.clickNode('si3');
        MatrixPage.getSelectedNodes().then(selected => expect(selected.length).toBe(2));

        MatrixPage.clickClearSelectionButton();
        MatrixPage.getSelectedNodes().then(selected => expect(selected.length).toBe(0));
    });


    it('create matrix from selected resources', () => {

        MatrixPage.clickSingleSelectionModeButton();
        MatrixPage.clickNode('si1');
        MatrixPage.clickNode('si5');
        MatrixPage.clickCreateGraphFromSelectionButton();

        browser.wait(EC.stalenessOf(MatrixPage.getNode('si2')), delays.ECWaitTime);
        browser.wait(EC.stalenessOf(MatrixPage.getNode('si3')), delays.ECWaitTime);
        browser.wait(EC.stalenessOf(MatrixPage.getNode('si4')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(MatrixPage.getNode('si1')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(MatrixPage.getNode('si5')), delays.ECWaitTime);

        MatrixPage.getEdges().then(edges => expect(edges.length).toBe(1));
        browser.wait(EC.presenceOf(MatrixPage.getAboveEdge('si1', 'si5')), delays.ECWaitTime);

        MatrixPage.clickReloadGraphButton();
        testDefaultMatrix();
    });


    it('switch between spatial and temporal relations', () => {

        testDefaultMatrix();

        MatrixPage.clickOptionsButton();
        MatrixPage.clickSpatialRelationsRadioButton();
        MatrixPage.getEdges().then(edges => expect(edges.length).toBe(0));

        MatrixPage.clickTemporalRelationsRadioButton();
        testDefaultMatrix();
    });


    it('toggle period clusters', () => {

        MatrixPage.getClusters().then(clusters => expect(clusters.length).toBe(2));
        MatrixPage.clickOptionsButton();
        MatrixPage.clickPeriodCheckbox();
        MatrixPage.getClusters().then(clusters => expect(clusters.length).toBe(0));
        MatrixPage.clickPeriodCheckbox();
        MatrixPage.getClusters().then(clusters => expect(clusters.length).toBe(2));
    });


    it('show matrix for different trenches', () => {

        testDefaultMatrix();
        MatrixPage.performSelectOperation(0);

        MatrixPage.getNodes().then(nodes => expect(nodes.length).toBe(1));
        browser.wait(EC.presenceOf(MatrixPage.getNode('si0')), delays.ECWaitTime);
        MatrixPage.getEdges().then(edges => expect(edges.length).toBe(0));

        MatrixPage.performSelectOperation(1);
        testDefaultMatrix();
    });


    it('clear selection when switching trenches', () => {

        MatrixPage.clickSingleSelectionModeButton();
        MatrixPage.clickNode('si1');

        MatrixPage.performSelectOperation(0);
        expect(MatrixPage.getClearSelectionButton().getAttribute('class')).toMatch('disabled');
        expect(MatrixPage.getCreateGraphFromSelectionButton().getAttribute('class')).toMatch('disabled');
    });
});