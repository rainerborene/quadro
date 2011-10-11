require 'test_helper'
 
describe Sticky do
  subject { Factory.build :sticky }

  should_be_valid Sticky

  should_validate_presence_of :content
  should_validate_presence_of :left
  should_validate_presence_of :top

  should_have_default_value :width, 300
  should_have_default_value :height, 200
  should_have_default_value :color, "yellow"
end
