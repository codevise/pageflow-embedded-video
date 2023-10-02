require 'pageflow/embedded_video/engine'
require 'pageflow/embedded_video/version'

module Pageflow
  module EmbeddedVideo
    def self.config
      @config ||= EmbeddedVideo::Configuration.new
    end

    def self.configure(&block)
      block.call(config)
    end

    def self.plugin
      EmbeddedVideo::Plugin.new
    end

    def self.page_type
      EmbeddedVideo::PageType.new
    end
  end
end
