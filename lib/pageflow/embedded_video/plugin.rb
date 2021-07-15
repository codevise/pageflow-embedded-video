module Pageflow
  module EmbeddedVideo
    class Plugin < Pageflow::Plugin
      def configure(config)
        config.page_types.register(EmbeddedVideo.page_type)
        config.features.register('embedded_video_opt_in')
      end
    end
  end
end
