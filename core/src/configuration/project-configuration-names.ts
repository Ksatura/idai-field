import { Name } from '../tools/named';

// Ordered by Name
export const PROJECT_MAPPING = {
    'abbircella': { prefix: 'AbbirCella', label: 'AbbirCella' },
    'al-ula': { prefix: 'AlUla', label: 'Al Ula' },
    'ayamonte': { prefix: 'Ayamonte', label: 'Ayamonte' },
    'bogazkoy-hattusa': { prefix: 'Boha', label: 'Boğazköy-Ḫattuša' },
    'bourgou': { prefix: 'Bourgou', label: 'Henchir el Bourgu' },
    'campidoglio': { prefix: 'Campidoglio', label: 'Campidoglio' },
    'castiglione': { prefix: 'Castiglione', label: 'Castiglione' },
    'chimtou': { prefix: 'Bourgou', label: 'Chimtou' },
    'elephantine': { prefix: 'Elephantine', label: 'Elephantine' },
    'gadara_bm': { prefix: 'Gadara', label: 'Gadara' },
    'heliopolis-project': { prefix: 'Heliopolis', label: 'Heliopolis' },
    'kalapodi': { prefix: 'Kalapodi', label: 'Kalapodi' },
    'karthagocircus': { prefix: 'KarthagoCircus', label: 'Karthago Circus' },
    'kephissostal': { prefix: 'Kephissostal', label: 'Kephissostal' },
    'meninx-project': { prefix: 'Meninx', label: 'Meninx' },
    'milet': { prefix: 'Milet', label: 'Milet' },
    'monte-turcisi': { prefix: 'MonTur', label: 'Monte Turcisi' },
    'olympia': { prefix: 'Olympia', label: 'Olympia' },
    'pergamongrabung': { prefix: 'Pergamon', label: 'Pergamon' },
    'postumii': { prefix: 'Postumii', label: 'Postumii' },
    'selinunt': { prefix: 'Selinunt', label: 'Selinunt' },
    'seli-bauteile': { prefix: 'SelinuntBauteile', label: 'Selinunt Bauteile' },
    'sel-akropolis': { prefix: 'SelinuntAkropolis', label: 'Selinunt Akropolis' },
    'sudan-heritage': { prefix: 'SudanHeritage', label: 'Sudan Heritage' },
    'uruk': { prefix: 'Uruk', label: 'Uruk' }
};


export function getConfigurationName(projectName: Name): Name|undefined {

    for (let [name, project] of Object.entries(PROJECT_MAPPING)) {
        if (projectName === name || projectName.startsWith(name + '-')) return project.prefix;
    }

    return undefined;
}
