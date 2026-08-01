import { BasketIcon } from '@sanity/icons/Basket';
import { BookIcon } from '@sanity/icons/Book';
import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentListItem().schemaType('global').id('global').title('Global Settings'),
      S.divider(),
      S.documentTypeListItem('comingSoon').title('Coming Soon'),
      S.documentTypeListItem('homepage').title('Homepage'),
      S.divider(),
      S.listItem()
        .title('Journal')
        .icon(BookIcon)
        .child(
          S.list()
            .title('Journal')
            .items([
              S.documentTypeListItem('journalCategory').title('Categories'),
              S.documentTypeListItem('journalPost').title('Posts'),
            ])
        ),
      S.listItem()
        .title('Shop')
        .icon(BasketIcon)
        .child(
          S.list()
            .title('Shop')
            .items([
              S.documentTypeListItem('shopCategory').title('Categories'),
              S.documentTypeListItem('shopTag').title('Tags'),
              S.documentTypeListItem('shopProduct').title('Products'),
            ])
        ),
    ]);
