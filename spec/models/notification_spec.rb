require 'spec_helper'

describe Notification do
  subject { Notification.new }

  it "should have receiver attribute" do
    subject.attributes.should have_key :receiver
  end

  it "should validates presence of resource" do
    subject.resource = nil
    subject.should_not be_valid
    subject.errors.get(:resource).should_not be_nil
  end

  it "should validates presence of action" do
    subject.action = nil
    subject.should_not be_valid
    subject.errors.get(:action).should_not be_nil
  end
end
