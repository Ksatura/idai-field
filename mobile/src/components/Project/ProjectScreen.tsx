import React, { useContext } from 'react';
import { ConfigurationContext } from '../../contexts/configuration-context';
import { PreferencesContext } from '../../contexts/preferences-context';
import useConfiguration from '../../hooks/use-configuration';
import usePouchdbManager from '../../hooks/use-pouchdb-datastore';
import useRelationsManager from '../../hooks/use-relations-manager';
import useRepository from '../../hooks/use-repository';
import useSync from '../../hooks/use-sync';
import DocumentsContainer from './DocumentsContainer';

const ProjectScreen: React.FC = () => {

    const preferences = useContext(PreferencesContext);

    const pouchdbManager = usePouchdbManager(preferences.preferences.currentProject);

    const config = useConfiguration(
        preferences.preferences.currentProject,
        preferences.preferences.languages,
        preferences.preferences.username,
        pouchdbManager,
    );

    const repository = useRepository(
        preferences.preferences.username,
        config?.getCategories() || [],
        pouchdbManager,
    );

    const syncStatus = useSync(
        preferences.preferences.currentProject,
        preferences.preferences.projects[preferences.preferences.currentProject],
        repository,
        pouchdbManager,
    );
    
    const relationsManager = useRelationsManager(
        repository?.datastore,
        config,
        preferences.preferences.username
    );

    return (repository && config && relationsManager)
        ? <ConfigurationContext.Provider value={ config }>
            <DocumentsContainer
                relationsManager={ relationsManager }
                repository={ repository }
                syncStatus={ syncStatus }
            />
        </ConfigurationContext.Provider>
        : null;
};


export default ProjectScreen;
