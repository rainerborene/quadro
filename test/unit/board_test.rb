require 'test_helper'
 
class BoardTest < ActiveSupport::TestCase
  context "A board instance" do
    subject { Factory :board }

    should_be_valid Board

    should_validate_presence_of :title
    should_have_key :collaborator_ids, Array
    should_have_key :stickies_count_cache, Integer
    should_have_default_value :share_public, false
    should_have_attr_protected :user_id

    should "has many stickies" do
      subject.stickies.push Factory.build :sticky
      assert subject.save
      assert subject.stickies.any?
    end

    should "has many collaborators" do
      subject.collaborators.push Factory :user
      assert subject.save
      assert subject.collaborators.any?
    end

    should "belongs to a user" do
      assert_instance_of User, subject.user
    end
  end
end
