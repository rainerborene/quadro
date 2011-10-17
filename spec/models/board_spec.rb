require 'spec_helper'
 
describe Board do
  subject { Factory :board }

  it { should validate_presence_of :title }
  it { should have_attribute_protected :user_id }
  it { should belongs_to :user }

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

  it "should not be shared by default" do
    subject.share_public.should be_false
  end
end
