require 'test_helper'
 
describe Board do
  subject { Factory :board }

  should_be_valid Board

  should_validate_presence_of :title
  should_have_key :collaborator_ids, Array
  should_have_key :stickies_count_cache, Integer
  should_have_default_value :share_public, false
  should_have_attr_protected :user_id

  it "should has many stickies" do
    subject.stickies.push Factory.build :sticky
    subject.save.must_equal true
    subject.stickies.wont_be_empty
  end

  it "should has many collaborators" do
    subject.collaborators.push Factory :user
    subject.save.must_equal true
    subject.collaborators.wont_be_empty
  end

  it "should belongs to a user" do
    subject.user.must_be_instance_of User
  end
end
