ENV["RAILS_ENV"] = "test"
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'
require 'factory_girl'

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

  def as_logged
    open_session do |session|
      get_via_redirect "/auth/twitter"
      yield if block_given?
    end
  end

  alias :require_authentication :as_logged

  # TODO: Need to extract some test helpers from the remarkable gem.
  class << self
    def should_validate_presence_of(attr)
      should "require #{attr} to be set" do
        subject.send("#{attr}=", nil)
        assert subject.invalid?
      end
    end

    def should_guarantee_value_of(attr, value)
      should "set #{attr} to #{value} by default" do
        assert_equal subject.send(attr), value
        assert subject.valid?
      end
    end

    def should_has_many(attr, options={})
      through = options[:in]
      description = "has many #{attr}"
      description << " through #{through}" unless through.nil?
      should(description) do
        assert_kind_of Array, subject.send(through || attr)
        assert_not_nil subject.send(attr)
      end
    end
  end
end
