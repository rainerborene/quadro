require 'spec_helper'
 
describe User do
  subject { Factory :user }

  it { should validate_presence_of :uid }
  it { should validate_presence_of :name }
  it { should validate_presence_of :nickname }
  it { should validate_presence_of :profile_image }
  it { should has_many :boards }

  it "should update attributes using OmniAuth hash schema" do
    auth = OmniAuth.config.mock_auth[:twitter]
    subject.update_with_omniauth(auth)
    subject.uid.should eql auth["uid"]
    subject.provider.should eql auth["provider"]
    subject.name.should eql auth["user_info"]["name"]
    subject.nickname.should eql auth["user_info"]["nickname"]
    subject.profile_image.should eql auth["user_info"]["image"]
    subject.token.should eql auth["credentials"]["token"]
    subject.secret_token.should eql auth["credentials"]["secret"]
  end

  it "should fetch all boards including shared" do
    subject.boards.create! Factory.attributes_for(:board)

    shared_board = Factory :board
    shared_board.push(:collaborator_ids => subject._id)
    shared_board.reload

    subject.all_boards.size.should equal 2
    subject.all_boards.should include shared_board
    subject.all_boards.should include subject.boards.first
  end

  it "should check if he owns a board through a secret token" do
    board = Factory :board, :user => subject
    subject.own?(board.secret_token).should be_true
    subject.own?("2ddecde").should_not be_true
  end
end
