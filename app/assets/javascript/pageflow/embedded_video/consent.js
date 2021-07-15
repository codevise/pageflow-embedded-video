pageflow.embeddedVideo.consent = new (pageflow.Object.extend({
  accepted: {},
  registered: {},

  ensureVendorRegistered: function(name) {
    var that = this;

    if (this.registered[name]) {
      return;
    }

    this.registered[name] = true;

    pageflow.consent.registerVendor(name, {
      paradigm: 'lazy opt-in',
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
