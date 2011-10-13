require 'spec_helper'
 
describe Board do
  subject { Factory :board }

  it "should validates presence of title" do
    subject.title = nil
    subject.should_not be_valid
  end

  it "should have user attribute protected" do
    subject.protected_attributes.should include :user_id
  end

  it "should has many collaborators" do
    subject.collaborators.push Factory :user
    subject.save.should be_true
    subject.collaborators.should_not be_empty
  end

  it "should has many stickies" do
    subject.stickies.push Factory.build :sticky
    subject.save.should be_true
    subject.stickies.should_not be_empty
  end

  it "should belongs to a user" do
    subject.user.should be_an_instance_of User
  end
end
