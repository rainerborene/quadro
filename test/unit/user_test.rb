require 'test_helper'
 
class UserTest < ActiveSupport::TestCase
  context "A user instance" do
    subject { Factory :user }

    should_be_valid User

    should_validate_presence_of :uid
    should_validate_presence_of :name
    should_validate_presence_of :nickname
    should_validate_presence_of :profile_image

    should_have_key :token, String
    should_have_key :secret_token, String
    should_have_key :latest_open, ObjectId
    should_have_default_value :provider, "twitter"

    should "has many boards" do
      subject.boards.create!(:title => "Untitled")
      assert subject.boards.any?
    end
  end
end
