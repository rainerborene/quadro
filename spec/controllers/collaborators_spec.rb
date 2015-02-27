require 'spec_helper'

describe CollaboratorsController do

  let(:user) { create :user }
  let(:board) { create :board, user: user }
  let(:willie) { create :user, name: "Pirate Willie", nickname: "willie" }

  before do
    session[:user_id] = user.id
  end

  describe "POST /boards/:id/collaborators" do
    it "should be able to be shared with Pirate Willie" do
      post :create, board_id: board.id, username: willie.nickname
      expect(assigns(:user)).to_not be_nil
      expect(assigns(:board).collaborator_ids).to include assigns(:user)._id
      expect(response.status).to be(201)
    end

    it "should not be able to add two times the same user" do
      board.push(collaborator_ids: willie._id)
      board.reload
      post :create, board_id: board.id, username: willie.nickname
      expect(response.status).to be(422)
    end

    it "should notify user only once" do
      notification = { :receiver => willie._id, :resource => board._id, :action => :collaboration }
      other_notification = notification.merge(resource: create(:board)._id)

      post :create, board_id: board.id, username: willie.nickname
      expect(assigns(:current_user).notifications).to_not be_empty
      expect(assigns(:current_user)).to be_notified(notification)
      expect(assigns(:current_user)).to_not be_notified(other_notification)
      expect(response.status).to be(201)

      post :create, board_id: board.id, username: willie.nickname
      expect(assigns(:current_user).notifications.size).to eq(1)
      expect(assigns(:board).collaborators.size).to eq(1)
      expect(response.status).to be(422)
    end
  end

  describe "DELETE /boards/:board_id/collaborators/:id" do
    it "should be able to be unshared with Pirate Willie" do
      board.push(collaborator_ids: willie._id)
      board.reload
      delete :destroy, board_id: board.id, id: willie.id
      expect(assigns(:board).collaborator_ids).to be_empty
      expect(response.status).to be(200)
    end
  end
end
