require 'spec_helper'
 
describe Sticky do
  subject { Factory.build :sticky }

  it "should validates presence of content" do
    subject.content = nil
    subject.should_not be_valid
    subject.errors.get(:content).should_not be_nil
  end

  it "should validates presence of top" do
    subject.top = nil
    subject.should_not be_valid
    subject.errors.get(:top).should_not be_nil
  end

  it "should validates presence of left" do
    subject.left = nil
    subject.should_not be_valid
    subject.errors.get(:left).should_not be_nil
  end

  it "should be instantiated with default values" do
    model = Sticky.new
    model.width.should eql 300
    model.height.should eql 200
    model.color.should eql "yellow"
    model.z_index.should eql 0
  end
end
