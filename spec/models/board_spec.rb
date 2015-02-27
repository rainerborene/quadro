require 'spec_helper'

describe Board do
  subject { create :board }

  it { is_expected.to validate_presence_of :title }
  it { is_expected.to have_attribute_protected :user_id }
  it { is_expected.to belongs_to :user }
  it { is_expected.to has_many(:collaborators, :in => :collaborator_ids) }
  it { is_expected.to has_many(:stickies) }
  it { expect(subject.share_public).to be false }
end
