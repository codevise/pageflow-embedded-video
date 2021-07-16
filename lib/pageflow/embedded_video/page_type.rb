module Pageflow
  module EmbeddedVideo
    class PageType < Pageflow::PageType
      name 'embedded_video'

      def view_helpers
        [ConsentHelper]
      end

      def json_seed_template
        'pageflow/embedded_video/page_type.json.jbuilder'
      end
    end
  end
end
