require 'test_helper'

class CollaboratorsTest < ActionDispatch::IntegrationTest
  describe "A board instance" do
    before do
      require_authentication
      @board = assigns(:board)
      @willie = Factory :user, :name => "Pirate Willie", :nickname => "willie"
    end

    it "should be able to be shared with Pirate Willie" do
      post "/boards/#{@board.id}/collaborators", :username => @willie.nickname
      assert_not_nil assigns(:user), "User should be created"
      assert_contains assigns(:board).collaborator_ids, assigns(:user)._id
      assert_response :created
    end

    it "should be able to be unshared with Pirate Willie" do
      @board.push(:collaborator_ids => @willie._id)
      @board.reload
      delete "/boards/#{@board.id}/collaborators/#{@willie.id}"
      assert assigns(:board).collaborator_ids.empty?
      assert_response :success
    end

    it "should notify user only once" do
      notification = { :receiver => @willie._id, :resource => @board._id, :action => :collaboration }
      other_notification = notification.merge({ :resource => FactoryGirl.create(:board)._id })

      post "/boards/#{@board.id}/collaborators", :username => @willie.nickname
      assert assigns(:current_user).notifications.any?
      assert assigns(:current_user).notified? notification
      assert !assigns(:current_user).notified?(other_notification)
      assert_response :created

      post "/boards/#{@board.id}/collaborators", :username => @willie.nickname
      assert assigns(:current_user).notifications.one?
      assert assigns(:board).collaborator_ids.one?
      assert_response :unprocessable_entity
    end
  end
end
