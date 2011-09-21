require 'test_helper'

class CollaboratorsTest < ActionDispatch::IntegrationTest

  context "A board instance" do
    setup do
      require_authentication
      @board = assigns(:board)
      @willie = Factory :user, :name => "Pirate Willie", :nickname => "willie"
    end

    should "be able to be shared with another user" do
      post "/boards/#{@board.id}/collaborators", :username => @willie.nickname
      assert_not_nil assigns(:user), "User should be created"
      assert_contains assigns(:board).collaborator_ids, assigns(:user)._id
    end

    should "be able to be unshared with another user" do
      @board.push(:collaborator_ids => @willie._id)
      @board.reload

      delete "/boards/#{@board.id}/collaborators/#{@willie.id}"
      assert assigns(:board).collaborator_ids.empty?
      assert_response :success
    end
  end

end
