require 'spec_helper'

describe Notification do
  subject { Notification.new }

  it { should have_key(:receiver, ObjectId) }
  it { should validate_presence_of :resource }
  it { should validate_presence_of :action}
end
