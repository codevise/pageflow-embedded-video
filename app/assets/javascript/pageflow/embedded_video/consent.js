pageflow.embeddedVideo.consent = new (pageflow.Object.extend({
  accepted: {},
  registered: {},

  ensureVendorRegistered: function(options) {
    var that = this;
    var name = options.name;

    if (this.registered[name]) {
      return;
    }

    this.registered[name] = true;

    pageflow.consent.registerVendor(name, {
      paradigm: options.skip ? 'skip' : 'lazy opt-in',
      displayName: I18n.t(
        'pageflow.public.embedded_video.consent.' + name + '.vendor_name'
      ),
      description: I18n.t(
        'pageflow.public.embedded_video.consent.' + name + '.vendor_description'
      )
    });

    pageflow.consent.requireAccepted(name).then(function(result) {
      if (result == 'fulfilled') {
        that.accepted[name] = true;
        that.trigger('accepted:' + name);
      }
    });
  }
}));
