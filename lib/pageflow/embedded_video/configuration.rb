module Pageflow
  module EmbeddedVideo
    class Configuration

      # White list of URL prefixes (including protocol) of embedded videos.
      # @return [Array<String>]
      attr_accessor :supported_hosts

      def initialize
        @supported_hosts = %w[
          https://youtu.be
          https://www.youtube.com
          http://www.youtube.com
          http://vimeo.com
          https://vimeo.com
        ]
      end
    end
  end
end
