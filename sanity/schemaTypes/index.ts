import { type SchemaTypeDefinition } from 'sanity';

import { comingSoon } from './documents/comingSoon';
import { global } from './documents/global';
import { homepage } from './documents/homepage';
import { journalCategory } from './documents/journalCategory';
import { journalPost } from './documents/journalPost';
import { shopCategory } from './documents/shopCategory';
import { shopProduct } from './documents/shopProduct';
import { shopTag } from './documents/shopTag';
import { benefitItem } from './objects/benefitItem';
import { localizedString, localizedText } from './objects/localizedString';
import { navLink } from './objects/navLink';
import { partnerItem } from './objects/partnerItem';
import { processStep } from './objects/processStep';
import { productInfoItem } from './objects/productInfoItem';
import { productStory } from './objects/productStory';
import { sectionHeader } from './objects/sectionHeader';
import { sectionHeaderPlain } from './objects/sectionHeaderPlain';
import { socialLink } from './objects/socialLink';
import { tasteNote } from './objects/tasteNote';
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
    productInfoItem,
    tasteNote,
    productStory,
    global,
    comingSoon,
    homepage,
    journalCategory,
    journalPost,
    shopCategory,
    shopTag,
    shopProduct,
  ],
};
