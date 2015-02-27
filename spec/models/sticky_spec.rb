require 'spec_helper'

describe Sticky do
  subject { Sticky.new }

  it { is_expected.to validate_presence_of :content }
  it { is_expected.to validate_presence_of :top }
  it { is_expected.to validate_presence_of :left }

  describe "when just created" do
    it { expect(subject.width).to eq(300) }
    it { expect(subject.height).to eq(200) }
    it { expect(subject.color).to eql "yellow" }
    it { expect(subject.z_index).to eq(0) }
  end
end
