require 'spec_helper'
 
describe Board do
  subject { Factory :board }

  it { should validate_presence_of :title }
  it { should have_attribute_protected :user_id }
  it { should belongs_to :user }
  it { should has_many(:collaborators, :in => :collaborator_ids) }
  it { should has_many(:stickies) }
  its(:share_public) { should be_false }
end
