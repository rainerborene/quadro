require 'test_helper'
 
class UserTest < ActiveSupport::TestCase
  context "A user instance" do
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

    should "has many boards" do
      subject.boards.create!(:title => "Untitled")
      assert subject.boards.any?
    end

    should "update attributes using OmniAuth hash schema" do
      auth = OmniAuth.config.mock_auth[:twitter]
      subject.update_with_omniauth(auth)
      assert_equal subject.uid, auth["uid"]
      assert_equal subject.provider, auth["provider"]
      assert_equal subject.name, auth["user_info"]["name"]
      assert_equal subject.nickname, auth["user_info"]["nickname"]
      assert_equal subject.profile_image, auth["user_info"]["image"]
      assert_equal subject.token, auth["credentials"]["token"]
      assert_equal subject.secret_token, auth["credentials"]["secret"]
    end

    should "fetch all boards including shared" do
      subject.boards.create! Factory.attributes_for(:board)

      shared_board = Factory :board
      shared_board.push(:collaborator_ids => subject._id)
      shared_board.reload

      assert_equal subject.all_boards.size, 2
      assert subject.all_boards.include? shared_board
      assert subject.all_boards.include? subject.boards.first
    end

    should "be able to check if user owns a board through the secret token" do
      board = Factory :board, :user => subject
      assert subject.own? board.secret_token
      assert !subject.own?("2ddecde")
    end
  end
end
