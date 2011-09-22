require 'test_helper'
 
class StickyTest < ActiveSupport::TestCase
  context "A sticky instance" do
    subject { Factory.build :sticky }

    should "be valid when new" do
      assert_kind_of Sticky, subject
      assert subject.valid?
    end
  end
end
