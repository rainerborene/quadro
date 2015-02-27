# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
require 'capybara/rails'
require 'capybara/poltergeist'

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}

Capybara.javascript_driver = :poltergeist

OmniAuth.config.test_mode = true
OmniAuth.config.add_mock(:twitter, {
  uid: '321897510',
  provider: 'twitter',
  credentials: { token: "token", secret: "secret" },
  info: {
    name: 'Jen Hawkins',
    nickname: 'jenhawkins',
    image: 'http://t3.gstatic.com/images?q=tbn:ANd9GcT5NiW1pPVujOmmiP58PAh8Sq0pLFPzucOj1FNhHwtQBk_WqmMmoEl2uFbA'
  }
})

RSpec.configure do |config|
  config.mock_with :rspec
  config.raise_errors_for_deprecations!
  config.infer_spec_type_from_file_location!
  config.include FactoryGirl::Syntax::Methods
  config.after(:each) do
    MongoMapper.database.collections.each do |collection|
      unless collection.name.match(/^system\./)
        collection.remove
      end
    end
  end
  config.before(:each) do
    OmniAuth.config.mock_auth[:twitter]
  end
end
