require File.expand_path('../boot', __FILE__)

require 'action_controller/railtie'
require 'action_view/railtie'
require 'sprockets/railtie'

Bundler.require(*Rails.groups)

module Quadro
  class Application < Rails::Application
    config.generators.orm = :mongo_mapper
  end
end
