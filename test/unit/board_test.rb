require 'test_helper'
 
class BoardTest < ActiveSupport::TestCase
  context "A board instance" do
    subject { Factory.build :board }

    should_validate_presence_of :title
    should_guarantee_value_of :share_public, false
    should_has_many :collaborators, :in => :collaborator_ids
    should_has_many :stickies

    should "be valid when new" do
      assert_kind_of Board, subject
      assert subject.valid?
    end
  end
end
