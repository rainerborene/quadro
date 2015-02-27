require 'spec_helper'

describe StickiesController do
  describe "A logged user" do
    let(:user) { create :user }
    let(:board) { create :board, user: user }

    before do
      session[:user_id] = user._id
      board.stickies << build(:sticky)
      board.save
    end

    describe "GET /boards/:board_id/stickies" do
      it "should be able to retrieve stickies" do
        get :index, board_id: board.id
        expect(assigns(:board).stickies).to_not be_empty
        expect(response.body).to eql assigns(:board).stickies.to_json
        expect(response.status).to be(200)
      end

      it "should set latest open attribute of current user" do
        get :index, board_id: board.id

        expect(assigns(:current_user).latest_open).to eql board.id
        expect(assigns(:board)._id).to eql board._id
        expect(board.destroy).to be_truthy
      end

      it "should not be able to view without permission" do
        expect { get board_stickies_path(board.id) }.to raise_error
      end
    end

    describe "POST /boards/:board_id/stickies" do
      it "should be able to create a sticky" do
        sticky = attributes_for :sticky, content: "I traveled to Hawaii"
        post :create, board_id: board.id, params: sticky
        expect(assigns(:board).stickies.size).to eq(2)
        expect(response.status).to be(200)
      end
    end

    describe "PUT /boards/:board_id/stickies/:id" do
      it "should be able to update a sticky" do
        sticky = board.stickies.first
        put :update, board_id: board.id, id: sticky.id, content: "After Hawaii went to Cancun"
        expect(assigns(:sticky).content).to eql("After Hawaii went to Cancun")
        expect(assigns(:sticky)._id).to eql sticky._id
        expect(response.status).to be(200)
      end
    end

    describe "DELETE /boards/:board_id/stickies/:id" do
      it "should be able to destroy a sticky" do
        sticky = board.stickies.first
        delete :destroy, board_id: board.id, id: sticky.id
        expect(assigns(:board).stickies).to be_empty
        expect(response.status).to be(200)
      end
    end
  end
end
