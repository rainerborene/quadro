require 'test_helper'
 
describe User do
  subject { Factory :user }

  should_be_valid User

  should_validate_presence_of :uid
  should_validate_presence_of :name
  should_validate_presence_of :nickname
  should_validate_presence_of :profile_image

  should_have_key :token, String
  should_have_key :secret_token, String
  should_have_key :latest_open, ObjectId
  should_have_default_value :provider, "twitter"

  it "should has many boards" do
    subject.boards.create!(:title => "Untitled")
    subject.boards.count.must_equal 1
  end

  it "should update attributes using OmniAuth hash schema" do
    auth = OmniAuth.config.mock_auth[:twitter]
    subject.update_with_omniauth(auth)
    subject.uid.must_equal auth["uid"]
    subject.provider.must_equal auth["provider"]
    subject.name.must_equal auth["user_info"]["name"]
    subject.nickname.must_equal auth["user_info"]["nickname"]
    subject.profile_image.must_equal auth["user_info"]["image"]
    subject.token.must_equal auth["credentials"]["token"]
    subject.secret_token.must_equal auth["credentials"]["secret"]
  end

  it "should fetch all boards including shared" do
    subject.boards.create! Factory.attributes_for(:board)

    shared_board = Factory :board
    shared_board.push(:collaborator_ids => subject._id)
    shared_board.reload

    subject.all_boards.size.must_equal 2
    subject.all_boards.must_include shared_board
    subject.all_boards.must_include subject.boards.first
  end

  it "should be able to check if user owns a board through the secret token" do
    board = Factory :board, :user => subject
    subject.own?(board.secret_token).must_equal true
    subject.own?("2ddecde").wont_equal true
  end
end
