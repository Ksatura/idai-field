import {flow, forEach} from 'tsfun';
import {lookup, map} from 'tsfun/associative';
import {FieldDocument} from 'idai-components-2';
import {ViewState} from './view-state';
import {NavigationPath} from './navigation-path';
import {ViewContext} from './view-context';
import {ResourcesViewMode} from '../view-facade';


/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export interface ResourcesState { // 'the' resources state

    overviewState: ViewState;
    typesManagementState: ViewState;
    operationViewStates: { [operationId: string]: ViewState };
    view: 'project' | string; // <- active view state
    activeDocumentViewTab: string|undefined;
}


export module ResourcesState {


    export function getQueryString(state: ResourcesState) {

        return viewState(state).bypassHierarchy
            ? viewState(state).searchContext.q
            : NavigationPath.getQueryString(getNavigationPath(state));
    }


    export function getCategoryFilters(state: ResourcesState) {

        return viewState(state).bypassHierarchy
            ? viewState(state).searchContext.categories
            : NavigationPath.getCategoryFilters(getNavigationPath(state));
    }


    export function getCustomConstraints(state: ResourcesState) {

        return viewState(state).bypassHierarchy
            ? viewState(state).customConstraints
            : {};
    }


    export function getSelectedDocument(state: ResourcesState): FieldDocument|undefined {

        return viewState(state).bypassHierarchy
            ? viewState(state).searchContext.selected
            : NavigationPath.getSelectedDocument(getNavigationPath(state));
    }


    export function getNavigationPath(state: ResourcesState): NavigationPath {

        const path: NavigationPath = viewState(state).navigationPath;
        return path ? path : NavigationPath.empty();
    }


    export function getCurrentOperation(state: ResourcesState): FieldDocument|undefined {

        return viewState(state).operation;
    }


    export function getExpandAllGroups(state: ResourcesState) {

        return viewState(state).expandAllGroups;
    }


    export function isInExtendedSearchMode(state: ResourcesState): boolean {

        return viewState(state).bypassHierarchy;
    }


    export function getActiveLayersIds(state: ResourcesState): string[] {

        const layersIds = viewState(state).layerIds;
        return layersIds ? layersIds : [];
    }


    export function getMode(state: ResourcesState): ResourcesViewMode {

        return viewState(state).mode;
    }


    export function setActiveDocumentViewTab(state: ResourcesState, activeDocumentViewTab: string|undefined) {

        state.activeDocumentViewTab = activeDocumentViewTab;
    }


    export function setQueryString(state: ResourcesState, q: string) {

        if (viewState(state).bypassHierarchy) {
            viewState(state).searchContext.q = q;
        } else {
            NavigationPath.setQueryString(getNavigationPath(state), q);
            updateNavigationPath(state, getNavigationPath(state));
        }
    }


    export function setCategoryFilters(state: ResourcesState, categories: string[]) {

        if (viewState(state).bypassHierarchy) {
            viewState(state).searchContext.categories = categories;
        } else {
            NavigationPath.setCategoryFilters(getNavigationPath(state), categories);
            updateNavigationPath(state, getNavigationPath(state));
        }
    }


    export function setCustomConstraints(state: ResourcesState,
                                         constraints: { [name: string]: string}) {

        viewState(state).customConstraints = constraints;
    }


    export function setSelectedDocument(state: ResourcesState,
                                        document: FieldDocument|undefined) {

        if (viewState(state).bypassHierarchy) {
            viewState(state).searchContext.selected = document;
        } else {
            NavigationPath.setSelectedDocument(getNavigationPath(state), document);
            updateNavigationPath(state, getNavigationPath(state));
        }
    }


    export function setActiveLayerIds(state: ResourcesState, activeLayersIds: string[]) {

        viewState(state).layerIds = activeLayersIds.slice(0);
    }


    export function setMode(state: ResourcesState, mode: ResourcesViewMode) {

        viewState(state).mode = mode;
    }


    export function updateNavigationPath(state: ResourcesState, navPath: NavigationPath) {

        viewState(state).navigationPath = navPath;
    }


    export function makeSampleDefaults(): ResourcesState {

        return {
            overviewState: {
                operation: undefined,
                layerIds: ['o25'],
                mode: 'map',
                bypassHierarchy: false,
                expandAllGroups: false,
                navigationPath: NavigationPath.empty(),
                searchContext: ViewContext.empty(),
                customConstraints: {}
            },
            typesManagementState: {
                operation: undefined,
                layerIds: [],
                mode: 'type-grid',
                bypassHierarchy: false,
                expandAllGroups: false,
                navigationPath: NavigationPath.empty(),
                searchContext: ViewContext.empty(),
                customConstraints: {}
            },
            operationViewStates: {
                't1': {
                    operation: undefined,
                    layerIds: ['o25'],
                    mode: 'map',
                    bypassHierarchy: false,
                    expandAllGroups: false,
                    navigationPath: NavigationPath.empty(),
                    searchContext: ViewContext.empty(),
                    customConstraints: {}
                }
            },
            view: 'project',
            activeDocumentViewTab: undefined
        }
    }


    export function makeDefaults(): ResourcesState {

        return {
            overviewState: ViewState.build(),
            typesManagementState: ViewState.build('type-grid'),
            operationViewStates: {},
            view: 'project',
            activeDocumentViewTab: undefined
        };
    }


    export function complete(state: ResourcesState): ResourcesState {

        ViewState.complete(state.overviewState);

        flow(state.operationViewStates,
            Object.keys,
            map(lookup(state.operationViewStates)),
            forEach(ViewState.complete));

        return state;
    }


    export function setExtendedSearchMode(state: ResourcesState, extendedSearchMode: boolean) {

        viewState(state).bypassHierarchy = extendedSearchMode;
    }


    export function toggleExpandAllGroups(state: ResourcesState) {

        viewState(state).expandAllGroups = !viewState(state).expandAllGroups;
    }


    export function deactivate(state: ResourcesState, viewName: string) {

        const deactivatedState: ViewState = ViewState.build();
        deactivatedState.operation = state.operationViewStates[viewName].operation;
        deactivatedState.layerIds = state.operationViewStates[viewName].layerIds;

        state.operationViewStates[viewName] = deactivatedState;
    }


    function viewState(state: ResourcesState): ViewState {

        return state.view === 'project'
            ? state.overviewState
            : state.view === 'types'
                ? state.typesManagementState
                : state.operationViewStates[state.view];
    }
}

