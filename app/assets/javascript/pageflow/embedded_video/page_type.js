/*global YT, URI, $f */

pageflow.pageType.registerInitializer('embedded_video', function(configuration) {
  var url = configuration.display_embedded_video_url;

  pageflow.embeddedVideo.consent.ensureVendorRegistered({
    name: pageflow.embeddedVideo.providerFromUrl(url),
    skip: !pageflow.features.isEnabled('embedded_video_opt_in')
  });
});

pageflow.react.registerPageTypeWithDefaultBackground('embedded_video', _.extend({
  prepareNextPageTimeout: 0,

  enhance: function(pageElement, configuration) {
    var url = configuration.display_embedded_video_url;

    pageflow.embeddedVideo.consent.setup(
      pageflow.embeddedVideo.providerFromUrl(url)
    );

    pageElement.thirdPartyEmbedConsent();

    if (!pageflow.features.isEnabled('embedded_video_opt_in')) {
      pageElement.find('.opt_out_wrapper').hide();
    }

    var that = this;

    pageElement.addClass('no_hidden_text_indicator');

    if (pageflow.features.has('mobile platform')) {
      pageElement.find('.close_button, .iframe_container').click(function(event) {
        event.stopPropagation();
        that._pauseVideo();
        pageElement.find('.iframe_container, .close_button').removeClass('show');
        pageflow.hideText.deactivate();
      });

      this._initPlaceholderImage(pageElement, configuration);
    }

    this.fullscreen = false;
    $(document).on('fullscreenchange mozfullscreenchange webkitfullscreenchange msfullscreenchange', function() {
      that.fullscreen = !that.fullscreen;
    });
  },

  resize: function(pageElement, configuration) {
    var iframeWrapper = pageElement.find('.iframe_wrapper');
    var pageHeader = pageElement.find('.page_header');
    var pageTitle = pageHeader.find('.title');
    var scroller = pageElement.find('.scroller');
    var container = pageElement.find('.iframe_container');
    var iframeOverlay = pageElement.find('.iframe_overlay');
    var videoCaption = pageElement.find('.video_caption');

    var mobile = pageflow.features.has('mobile platform');
    var allowSplitLayout = !configuration.full_width || this.fullscreen;

    pageElement.toggleClass('page-with_split_layout', allowSplitLayout);

    var splitLayout = pageflow.pageSplitLayout.pageIsWideEnough(pageElement) && allowSplitLayout;

    iframeWrapper.add(scroller).toggleClass('widescreened', splitLayout);

    if (!this.fullscreen) {
      if (splitLayout || mobile) {
        if (!container.find('iframe').length) {
          container.append(iframeWrapper);
        }
      }
      else {
        if (!scroller.find('iframe').length) {
          iframeWrapper.insertAfter(pageHeader);
        }
      }
    }

    if (splitLayout) {
      iframeWrapper.append(videoCaption);
    }
    else if (mobile) {
      iframeOverlay.after(videoCaption);
    }
    else {
      iframeWrapper.after(videoCaption);
    }

    scroller.scroller('refresh');
  },

  prepare: function(pageElement, configuration) {},

  activating: function(pageElement, configuration) {
    var that = this;

    this.listenTo(pageflow.settings, "change:volume", function(model, value) {
      that._setPlayerVolume(value);
    });

    this._createPlayer(pageElement, configuration);

    this.resize(pageElement, configuration);
    this.active = true;
  },

  activated: function(pageElement, configuration) {},

  deactivating: function(pageElement, configuration) {
    this.active = false;
    this.stopListening(pageflow.settings);
    this._removePlayer(pageElement);
  },

  deactivated: function(pageElement, configuration) {
  },

  update: function(pageElement, configuration) {
    this.updateDefaultPageContent(pageElement, configuration);

    var that = this,
        iframeWrapper = pageElement.find('.iframe_wrapper'),
        captionElement = pageElement.find('.video_caption'),
        captionTextElement = pageElement.find('.video_caption_text'),
        caption = configuration.get('video_caption');

    captionElement.toggleClass('video_caption_blank', (caption || '').trim() === '');
    captionTextElement.text(caption || '');

    if (this.active) {
      if (configuration.hasChanged('display_embedded_video_url') ||
          configuration.hasChanged('embedded_video_hide_info') ||
          configuration.hasChanged('embedded_video_hide_controls')) {
        this._removePlayer(pageElement, function() {
          that._createPlayer(pageElement, configuration.attributes);
        });
      }
    }

    pageElement.find('.shadow').css({
      opacity: configuration.get('gradient_opacity') / 100
    });

    this.resize(pageElement, configuration.attributes);
  },

  _createPlayer: function(pageElement, configuration) {
    var that = this,
        url = configuration.display_embedded_video_url,
        provider = pageflow.embeddedVideo.providerFromUrl(url);

    pageflow.embeddedVideo.consent.setup(
      pageflow.embeddedVideo.providerFromUrl(url)
    );

    if (!pageflow.embeddedVideo.consent.accepted[provider]) {
      pageflow.embeddedVideo.consent.once('accepted:' + provider, function() {
        this._createPlayer(pageElement, configuration);
      }, this);
      return;
    }

    if (provider === 'youtube') {
      this.ytApiInitialize().done(function () {
        that._createYouTubePlayer(pageElement, url, configuration);
      });
    }
    else if (provider == 'vimeo') {
      that._createVimeoPlayer(pageElement, url, configuration);
    }
  },

  ytApiInitialize: function() {
    if (!window.youtubeInitialized) {
      var ytApi = new $.Deferred();
      window.youtubeInitialized = ytApi.promise();

      window.onYouTubeIframeAPIReady = function() {
        ytApi.resolve();
      };

      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    return window.youtubeInitialized;
  },

  _createYouTubePlayer: function(pageElement, url, configuration) {
    var that = this,
        div = document.createElement('div');

    this.playerId = 'youtube-player-' + this._getRandom(url);

    div.setAttribute('id', this.playerId);
    pageElement.find('.iframe_wrapper').prepend(div);

    this.ytApiInitialize().done(function() {
      new YT.Player(div, {
        height: '100%',
        width: '100%',
        videoId: that._getVideoId(url),
        playerVars: {
          rel: '0',
          start: that._getVideoStartTime(url),
          controls: configuration.embedded_video_hide_controls ? '0' : '1'
        },
        events: {
          'onReady': function(event) {
            that.player = event.target;
            that._setPlayerVolume(pageflow.settings.get('volume'));
          }
        }
      });
    });
  },

  _createVimeoPlayer: function(pageElement, url, configuration) {
    var that = this,
        iframe = document.createElement('iframe'),
        uri = new URI('//player.vimeo.com/video/');

    this.playerId = 'vimeo-player-' + this._getRandom(url);

    uri.filename(that._getVideoId(url));
    uri.search({
      api: '1',
      player_id: this.playerId,
      byline: configuration.embedded_video_hide_info ? '0' : '1',
      title: configuration.embedded_video_hide_info ? '0' : '1',
      portrait: configuration.embedded_video_hide_info ? '0' : '1'
    });

    uri.fragment(new URI(url).fragment());

    $(iframe).attr({
      id: this.playerId,
      width: '100%',
      height: '100%',
      frameborder: '0',
      webkitallowfullscreen: true,
      mozallowfullscreen: true,
      allowfullscreen: true,
      src: uri.toString()
    });

    pageElement.find('.iframe_wrapper').prepend(iframe);

    this.player = $f(iframe);

    this.player.addEvent('ready', function() {
      that._setPlayerVolume(pageflow.settings.get('volume'));
    });
  },

  _setPlayerVolume: function(value) {
    if (this.player) {
      if (typeof this.player.setVolume === 'function') {
        this.player.setVolume(value * 100);
      } else if (typeof this.player.api === 'function') {
        this.player.api('setVolume', value);
      }
    }
  },

  _pauseVideo: function() {
    if (this.player) {
      if (typeof this.player.pauseVideo === 'function') {
        this.player.pauseVideo();
      } else if (typeof this.player.api === 'function') {
        this.player.api('pause');
      }
    }
  },

  _removePlayer: function (pageElement, callback) {
    pageflow.embeddedVideo.consent.off(null, null, this);

    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
    }
    this.player = null;
    $('#' + this.playerId, pageElement).remove();

    if (typeof callback === 'function') {
      callback();
    }
  },

  _initPlaceholderImage: function(pageElement, configuration) {
    var $div = $(document.createElement('div')),
      pageHeader = pageElement.find('.page_header'),
      containerAndCloseButton = pageElement.find('.iframe_container, .close_button'),
      url = configuration.display_embedded_video_url;

    $div.addClass('iframe_overlay ' + pageflow.embeddedVideo.providerFromUrl(url));

    this._setBackgroundImage(url, $div);
    pageHeader.after($div);

    $div.click(function(event) {
      event.preventDefault();
      containerAndCloseButton.addClass('show');
      pageflow.hideText.activate();
    });
  },

  _setBackgroundImage: function(url, element) {
    var provider = pageflow.embeddedVideo.providerFromUrl(url),
        videoId = this._getVideoId(url),
        imageUrl = '';

    if (provider === 'youtube') {
      imageUrl = 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
      element.css('background-image', 'url("' + imageUrl + '")');
    }
    else if (provider === 'vimeo') {
      var src = "https://vimeo.com/api/v2/video/" + videoId + ".json";

      $.getJSON(src, function(data) {
        element.css('background-image', 'url("' + data[0].thumbnail_large + '")');
      });
    }
  },

  _getVideoId: function(url) {
    var uri = new URI(url),
        domain = uri.domain(true);

    if (['youtu.be', 'vimeo.com'].indexOf(domain) >= 0) {
      return uri.filename();
    }
    else if (domain === 'youtube.com') {
      if (uri.directory() === '/embed') {
        return uri.filename();
      }
      else {
        return uri.search(true).v;
      }
    }

    return '';
  },

  _getVideoStartTime: function(url) {
    var query = new URI(url).query();
    var params = query.split('&');
    var that = this;

    return _.reduce(params, function(result, param) {
      var parts = param.split('=');

      if (parts[0] === 't') {
        return that._timestampToSeconds(parts[1] || '');
      }

      return result;
    }, 0);
  },

  _timestampToSeconds: function(timestamp) {
    if (timestamp.match(/\d+m(\d+s)?/)) {
      var parts = timestamp.split('m');
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || 0, 10);
    }
    else if (timestamp.match(/\d+s?/)) {
      return parseInt(timestamp || 0, 10);
    }
    else {
      return 0;
    }
  },

  _getRandom: function(string) {
    string = string + new Date().getTime();
    var hash = 0, i, chr, len;
    if (string === 0) return hash;
    for (i = 0, len = string.length; i < len; i++) {
      chr   = string.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}, pageflow.defaultPageContent));
