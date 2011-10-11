require 'test_helper'

describe Notification do
  subject { Notification.new }
  should_have_key :receiver, ObjectId
  should_have_key :resource, ObjectId
  should_have_key :action, String
end
