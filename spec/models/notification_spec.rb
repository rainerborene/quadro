require 'spec_helper'

describe Notification do
  subject { Notification.new }

  it { is_expected.to have_key(:receiver, ObjectId) }
  it { is_expected.to validate_presence_of :resource }
  it { is_expected.to validate_presence_of :action}
end
