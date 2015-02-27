require 'spec_helper'

describe User do
  subject { create :user }

  it { is_expected.to validate_presence_of :uid }
  it { is_expected.to validate_presence_of :name }
  it { is_expected.to validate_presence_of :nickname }
  it { is_expected.to validate_presence_of :profile_image }
  it { is_expected.to has_many :boards }

  describe ".update_with_omniauth" do
    it "should update attributes using OmniAuth hash schema" do
      auth = OmniAuth.config.mock_auth[:twitter]
      subject.update_with_omniauth(auth)
      expect(subject.uid).to eql auth["uid"]
      expect(subject.provider).to eql auth["provider"]
      expect(subject.name).to eql auth["info"]["name"]
      expect(subject.nickname).to eql auth["info"]["nickname"]
      expect(subject.profile_image).to eql auth["info"]["image"]
      expect(subject.token).to eql auth["credentials"]["token"]
      expect(subject.secret_token).to eql auth["credentials"]["secret"]
    end
  end

  describe ".all_boards" do
    let(:shared_board) { create :board }

    it "should fetch all boards including shared ones" do
      subject.boards.create! attributes_for(:board)
      shared_board.push(:collaborator_ids => subject._id)
      shared_board.reload
      expect(subject.all_boards.size).to equal 2
      expect(subject.all_boards).to include shared_board
      expect(subject.all_boards).to include subject.boards.first
    end
  end

  describe "#own?" do
    it "should verify permission given a secret token" do
      board = create :board, :user => subject
      expect(subject).to be_own(board.secret_token)
      expect(subject).to_not be_own("2ddecde")
    end
  end
end
