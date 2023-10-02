# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'pageflow/embedded_video/version'

Gem::Specification.new do |spec|
  spec.name          = 'pageflow-embedded-video'
  spec.version       = Pageflow::EmbeddedVideo::VERSION
  spec.authors       = ['Codevise Solutions Ltd']
  spec.email         = ['info@codevise.de']
  spec.summary       = 'Pagetype for embedded youtube/vimeo videos'
  spec.homepage      = 'https://github.com/codevise/pageflow-embedded-video'
  spec.license       = 'MIT'

  spec.files         = `git ls-files`.split($/)
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ['lib']

  spec.required_ruby_version = '>= 2.1'

  spec.add_runtime_dependency 'pageflow', ['>= 15.7', '< 17']
  spec.add_runtime_dependency 'pageflow-public-i18n', '~> 1.0'

  spec.add_development_dependency 'bundler', ['>= 1.0', '< 3']
  spec.add_development_dependency 'pageflow-support', ['>= 14', '< 17']
  spec.add_development_dependency 'rake', '~> 12.0'

  if ENV['PAGEFLOW_DEPENDENCIES'] == 'experimental'
    spec.add_development_dependency 'rspec-rails', '~> 6.0'
  else
    spec.add_development_dependency 'rspec-rails', '~> 3.0'
  end

  # Semantic versioning rake tasks
  spec.add_development_dependency 'semmy', '~> 1.0'
end
