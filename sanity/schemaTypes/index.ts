import { type SchemaTypeDefinition } from 'sanity';

import { comingSoon } from './documents/comingSoon';
import { global } from './documents/global';
import { localizedString, localizedText } from './objects/localizedString';
import { navLink } from './objects/navLink';
import { sectionHeader } from './objects/sectionHeader';
import { socialLink } from './objects/socialLink';
import { textItem } from './objects/textItem';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    localizedString,
    localizedText,
    navLink,
    socialLink,
    sectionHeader,
    textItem,
    global,
    comingSoon,
  ],
};
