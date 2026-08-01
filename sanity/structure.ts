import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentListItem().schemaType('global').id('global').title('Global Settings'),
      S.divider(),
      S.documentTypeListItem('comingSoon').title('Coming Soon'),
      S.documentTypeListItem('homepage').title('Homepage'),
    ]);
