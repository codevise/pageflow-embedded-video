module Pageflow
  module EmbeddedVideo
    # @api private
    module ConsentHelper
      include PageflowPaged::ThirdPartyEmbedConsentHelper

      def embedded_video_opt_in(entry, configuration)
        vendor_name = embedded_video_consent_vendor_name(configuration)
        return unless vendor_name

        vendor_display_name = I18n.t(
          "pageflow.public.embedded_video.consent.#{vendor_name}.vendor_name"
        )

        third_party_embed_opt_in(
          entry: entry,
          vendor_name: vendor_name,
          message: t('pageflow.public.embedded_video.opt_in_prompt',
                     vendor: vendor_display_name)
        )
      end

      def embedded_video_consent_vendor_name(configuration)
        if configuration['display_embedded_video_url'] =~ /youtube\.com/ ||
           configuration['display_embedded_video_url'] =~ /youtu\.be/
          'youtube'
        elsif configuration['display_embedded_video_url'] =~ /vimeo\.com/
          'vimeo'
        end
      end
    end
  end
end
