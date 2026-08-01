import { type SchemaTypeDefinition } from 'sanity';

import { comingSoon } from './documents/comingSoon';
import { global } from './documents/global';
import { homepage } from './documents/homepage';
import { benefitItem } from './objects/benefitItem';
import { localizedString, localizedText } from './objects/localizedString';
import { navLink } from './objects/navLink';
import { partnerItem } from './objects/partnerItem';
import { processStep } from './objects/processStep';
import { sectionHeader } from './objects/sectionHeader';
import { sectionHeaderPlain } from './objects/sectionHeaderPlain';
import { socialLink } from './objects/socialLink';
import { testimonialItem } from './objects/testimonialItem';
import { textItem } from './objects/textItem';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    localizedString,
    localizedText,
    navLink,
    socialLink,
    sectionHeader,
    sectionHeaderPlain,
    textItem,
    benefitItem,
    processStep,
    partnerItem,
    testimonialItem,
    global,
    comingSoon,
    homepage,
  ],
};
