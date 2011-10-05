require 'test_helper'

class NotificationTest < ActiveSupport::TestCase
  context "A notification instance" do
    should_have_key :receiver, ObjectId
    should_have_key :resource, ObjectId
    should_have_key :action, String
  end
end
