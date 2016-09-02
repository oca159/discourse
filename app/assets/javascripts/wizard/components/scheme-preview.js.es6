import { observes } from 'ember-addons/ember-computed-decorators';

const WIDTH  = 400;
const HEIGHT = 200;

const SCHEMES = {
  default: {
    primary: '#222222',
    secondary: '#FFFFFF',
    headerBackground: '#ffffff',
    tertiary: '#0088cc'
  },

  dark: {
    primary: '#ddd',
    secondary: '#222',
    headerBackground: '#111',
    tertiary: '#0F82AF'
  }
};

const LOREM = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Nullam eget sem non elit tincidunt rhoncus. Fusce velit nisl,
porttitor sed nisl ac, consectetur interdum metus. Fusce in
consequat augue, vel facilisis felis. Nunc tellus elit, and
semper vitae orci nec, blandit pharetra enim. Aenean a ebus
posuere nunc. Maecenas ultrices viverra enim ac commodo
Vestibulum nec quam sit amet libero ultricies sollicitudin.
Nulla quis scelerisque sem, eget volutpat velit. Fusce eget
accumsan sapien, nec feugiat quam. Quisque non risus.
placerat lacus vitae, lacinia nisi. Sed metus arcu, iaculis
sit amet cursus nec, sodales at eros.`;

function loadImage(src) {
  const img = new Image();
  img.src = src;

  return new Ember.RSVP.Promise(resolve => {
    img.onload = () => resolve(img);
  });
};

export default Ember.Component.extend({
  ctx: null,
  width: WIDTH,
  height: HEIGHT,
  loaded: false,
  logo: null,

  colorScheme: Ember.computed.alias('step.fieldsById.color_scheme.value'),

  didInsertElement() {
    this._super();
    const c = this.$('canvas')[0];
    this.ctx = c.getContext("2d");

    Ember.RSVP.Promise.all([loadImage('/images/wizard/discourse-small.png'),
                            loadImage('/images/wizard/trout.png')]).then(result => {
      this.logo = result[0];
      this.avatar = result[1];
      this.loaded = true;
      this.triggerRepaint();
    });
  },

  @observes('colorScheme')
  triggerRepaint() {
    Ember.run.scheduleOnce('afterRender', this, 'repaint');
  },

  repaint() {
    if (!this.loaded) { return; }

    const { ctx } = this;
    const headerHeight = HEIGHT * 0.15;

    const colorScheme = this.get('colorScheme');
    const colors = SCHEMES[colorScheme];
    if (!colors) { return; }

    ctx.fillStyle = colors.secondary;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const isDark = colorScheme === 'dark';
    // Header area
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, WIDTH, headerHeight);
    ctx.fillStyle = colors.headerBackground;
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    ctx.restore();

    const margin = WIDTH * 0.02;

    // Logo
    const headerMargin = headerHeight * 0.2;
    const logoHeight = headerHeight - (headerMargin * 2);
    const logoWidth = (logoHeight / this.logo.height) * this.logo.width;
    ctx.drawImage(this.logo,
                  headerMargin,
                  headerMargin,
                  logoWidth,
                  logoHeight);


    // Draw a fake topic
    const avatarSize = HEIGHT * 0.1;
    ctx.drawImage(this.avatar, margin, headerHeight + 30, avatarSize, avatarSize);
    ctx.drawImage(this.avatar, WIDTH - avatarSize - headerMargin, headerMargin, avatarSize, avatarSize);

    ctx.beginPath();
    ctx.fillStyle = colors.primary;
    ctx.font = "bold 0.75em 'Arial'";
    ctx.fillText(I18n.t('wizard.preview.title'), margin, 50);

    ctx.font = "0.5em 'Arial'";

    let line = 0;

    const lines = LOREM.split("\n");
    for (let i=0; i<10; i++) {
      line = 60 + (i * 12);
      ctx.fillText(lines[i], margin + avatarSize + margin, line);
    }

    // Reply Button
    ctx.beginPath();
    ctx.rect(230, line + 12, WIDTH * 0.1, HEIGHT * 0.07);
    ctx.fillStyle = colors.tertiary;
    ctx.fill();
    ctx.fillStyle = isDark ? colors.primary : colors.secondary;
    ctx.font = "8px 'Arial'";
    ctx.fillText(I18n.t('wizard.preview.reply'), 238, line+22);

    // draw border
    ctx.beginPath();
    ctx.strokeStyle='rgba(0, 0, 0, 0.6)';
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.stroke();
  }

});
