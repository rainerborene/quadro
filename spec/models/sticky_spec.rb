require 'spec_helper'
 
describe Sticky do
  subject { Sticky.new }

  it { should validate_presence_of :content }
  it { should validate_presence_of :top }
  it { should validate_presence_of :left }

  describe "when just created" do
    its(:width) { should eq(300) }
    its(:height) { should eq(200) }
    its(:color) { should eql "yellow" }
    its(:z_index) { should eq(0) }
  end
end
