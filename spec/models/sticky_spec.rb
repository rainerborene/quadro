require 'spec_helper'
 
describe Sticky do
  subject { Factory.build :sticky }

  it { should validate_presence_of :content }
  it { should validate_presence_of :top }
  it { should validate_presence_of :left }

  it "should be instantiated with default values" do
    model = Sticky.new
    model.width.should eql 300
    model.height.should eql 200
    model.color.should eql "yellow"
    model.z_index.should eql 0
  end
end
