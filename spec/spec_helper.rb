# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
require 'capybara/rspec'

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}

Capybara.javascript_driver = :selenium

OmniAuth.config.test_mode = true
OmniAuth.config.add_mock(:twitter, {
  :uid => '321897510',
  :provider => 'twitter',
  :credentials => { :token => "token", :secret => "secret" },
  :user_info => {
    :name => 'Jen Hawkins',
    :nickname => 'jenhawkins',
    :image => 'http://t3.gstatic.com/images?q=tbn:ANd9GcT5NiW1pPVujOmmiP58PAh8Sq0pLFPzucOj1FNhHwtQBk_WqmMmoEl2uFbA' }
})

RSpec.configure do |config|
  # == Mock Framework
  #
  # If you prefer to use mocha, flexmock or RR, uncomment the appropriate line:
  #
  # config.mock_with :mocha
  # config.mock_with :flexmock
  # config.mock_with :rr
  config.mock_with :rspec

  config.after(:each) do 
    MongoMapper.database.collections.each(&:remove) 
  end 
end
