require 'test_helper'
 
class BoardTest < ActiveSupport::TestCase
  context "A board instance" do
    subject { Factory.build :board }

    should_be_valid Board

    should_validate_presence_of :title
    should_have_key :collaborator_ids, Array
    should_have_key :stickies_count_cache, Integer
    should_have_default_value :share_public, false

    should_have_attr_protected :user_id
  end
end
