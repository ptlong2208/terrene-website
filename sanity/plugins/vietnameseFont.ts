import { definePlugin } from 'sanity';

const STYLE_ID = 'vietnamese-font-override';

export const vietnameseFont = definePlugin({
  name: 'vietnamese-font',
  studio: {
    components: {
      layout: (props) => {
        if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
          const style = document.createElement('style');
          style.id = STYLE_ID;
          style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

            :root {
              --font-heading: 'Be Vietnam Pro', sans-serif;
              --font-text: 'Be Vietnam Pro', sans-serif;
              --font-label: 'Be Vietnam Pro', sans-serif;
            }

            body,
            #sanity,
            [data-ui='Text'],
            [data-ui='Heading'],
            [data-ui='Label'],
            [data-ui='Button'] {
              font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                'Helvetica Neue', Helvetica, Arial, sans-serif !important;
            }
          `;
          document.head.appendChild(style);
        }
        return props.renderDefault(props);
      },
    },
  },
});
