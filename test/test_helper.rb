ENV["RAILS_ENV"] = "test"
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'
require 'factory_girl'

Shoulda.autoload_macros Rails.root.to_s

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

class ActiveSupport::TestCase
  # Drop all collections after each test case.
  def teardown
    MongoMapper.database.collections.each do |coll|
      coll.remove  
    end
  end

  # Make sure that each test case has a teardown
  # method to clear the db after each test.
  def inherited(base)
    base.define_method teardown do 
      super
    end
  end

  def require_authentication
    open_session do |session|
      get_via_redirect "/auth/twitter"
      yield if block_given?
    end
  end

  alias_method :as_logged, :require_authentication
end
