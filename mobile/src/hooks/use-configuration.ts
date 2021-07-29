import { PouchdbDatastore, ProjectConfiguration } from 'idai-field-core';
import { useEffect, useState } from 'react';
import loadConfiguration from '../services/config/load-configuration';

const useConfiguration = (
    project: string,
    languages: string[],
    username: string,
    pouchdbDatastore: PouchdbDatastore | undefined,
): ProjectConfiguration | undefined => {

    const [config, setConfig] = useState<ProjectConfiguration>();

    useEffect(() => {

        if (!pouchdbDatastore || !pouchdbDatastore.open || !project) return;
        
        loadConfiguration(pouchdbDatastore, project, languages, username)
            .then(setConfig);
    }, [pouchdbDatastore, pouchdbDatastore?.open, project, languages, username]);

    return config;
};

export default useConfiguration;
