require 'spec_helper'

describe BoardsController do
  describe "A board instance" do
    before do
      get_via_redirect "/auth/twitter"
      @board = assigns(:board)
      @willie = Factory :user, :name => "Pirate Willie", :nickname => "willie"
    end

    it "should be able to be shared with Pirate Willie" do
      post "/boards/#{@board.id}/collaborators", :username => @willie.nickname
      assigns(:user).should_not be_nil
      assigns(:board).collaborator_ids.should include assigns(:user)._id
      response.response_code.should equal 201
    end

    it "should be able to be unshared with Pirate Willie" do
      @board.push(:collaborator_ids => @willie._id)
      @board.reload
      delete "/boards/#{@board.id}/collaborators/#{@willie.id}"
      assigns(:board).collaborator_ids.should be_empty
      response.response_code.should equal 200
    end

    it "should notify user only once" do
      notification = { :receiver => @willie._id, :resource => @board._id, :action => :collaboration }
      other_notification = notification.merge({ :resource => FactoryGirl.create(:board)._id })

      post "/boards/#{@board.id}/collaborators", :username => @willie.nickname
      assigns(:current_user).notifications.should_not be_empty
      assigns(:current_user).should be_notified(notification)
      assigns(:current_user).should_not be_notified(other_notification)
      response.response_code.should equal 201

      post "/boards/#{@board.id}/collaborators", :username => @willie.nickname
      assigns(:current_user).should have(1).notifications
      assigns(:board).should have(1).collaborators
      response.response_code.should equal 422
    end
  end
end
