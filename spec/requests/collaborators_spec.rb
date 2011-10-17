require 'spec_helper'

describe BoardsController do
  describe "A board instance" do
    before do
      get_via_redirect "/auth/twitter"
      @board = assigns(:board)
      @willie = Factory :user, :name => "Pirate Willie", :nickname => "willie"
    end

    it "should be able to be shared with Pirate Willie" do
      post board_collaborators_path(@board.id), :username => @willie.nickname
      assigns(:user).should_not be_nil
      assigns(:board).collaborator_ids.should include assigns(:user)._id
      response.status.should be(201)
    end

    it "should be able to be unshared with Pirate Willie" do
      @board.push(:collaborator_ids => @willie._id)
      @board.reload
      delete board_collaborator_path(:board_id => @board.id, :id => @willie.id)
      assigns(:board).collaborator_ids.should be_empty
      response.status.should be(200)
    end

    it "should not be able to add two times the same user" do
      @board.push(:collaborator_ids => @willie._id)
      @board.reload
      post board_collaborators_path(@board.id), :username => @willie.nickname
      response.status.should be(422)
    end

    it "should notify user only once" do
      notification = { :receiver => @willie._id, :resource => @board._id, :action => :collaboration }
      other_notification = notification.merge({ :resource => FactoryGirl.create(:board)._id })

      post board_collaborators_path(@board.id), :username => @willie.nickname
      assigns(:current_user).notifications.should_not be_empty
      assigns(:current_user).should be_notified(notification)
      assigns(:current_user).should_not be_notified(other_notification)
      response.status.should be(201)

      post board_collaborators_path(@board.id), :username => @willie.nickname
      assigns(:current_user).should have(1).notifications
      assigns(:board).should have(1).collaborators
      response.status.should be(422)
    end
  end
end
