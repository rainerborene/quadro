require 'test_helper'
 
class UserTest < ActiveSupport::TestCase
  context "A user instance" do
    subject { Factory.build :user }

    should "be valid when new" do
      assert_kind_of User, subject
      assert subject.valid?
    end
  end
end
