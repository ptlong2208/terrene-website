import { type SchemaTypeDefinition } from 'sanity'
import { localizedString, localizedText } from './objects/localizedString'
import { navLink } from './objects/navLink'
import { socialLink } from './objects/socialLink'
import { sectionHeader } from './objects/sectionHeader'
import { textItem } from './objects/textItem'
import { global } from './documents/global'
import { comingSoon } from './documents/comingSoon'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [localizedString, localizedText, navLink, socialLink, sectionHeader, textItem, global, comingSoon],
}
