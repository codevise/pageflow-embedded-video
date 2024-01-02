require 'pageflow-public-i18n'

module Pageflow
  module EmbeddedVideo
    class Engine < Rails::Engine
      isolate_namespace Pageflow::EmbeddedVideo

      if Rails.respond_to?(:autoloaders)
        lib = root.join('lib')

        config.autoload_paths << lib
        config.eager_load_paths << lib

        initializer 'pageflow_embedded_video.autoloading' do
          Rails.autoloaders.main.ignore(
            lib.join('pageflow-embedded-video.rb'),
            lib.join('pageflow/embedded_video/configuration.rb'),
            lib.join('pageflow/embedded_video/version.rb')
          )
        end
      else
        config.autoload_paths << File.join(config.root, 'lib')
      end

      config.i18n.load_path += Dir[config.root.join('config', 'locales', '**', '*.yml').to_s]
    end
  end
end
