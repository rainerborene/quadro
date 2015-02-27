require 'spec_helper'

describe BoardsController do
  describe "A logged user" do
    let!(:user) { create :user }

    before do
      session[:user_id] = user.id
    end

    describe "GET /boards" do
      it "should be able to retrieve boards" do
        get :index
        boards = Board.all
        expect(response.body).to eq boards.to_json
        expect(response.status).to eq(200)
      end
    end

    describe "POST /boards" do
      it "should be able to create a board" do
        post :create, title: "Testing Roadmap"
        expect(assigns(:board)).to_not be_nil
        expect(assigns(:board)).to_not be_new_record
        expect(response.body).to eql assigns(:board).to_json
        expect(response.status).to be(201)
      end
    end

    describe "PUT /boards/:id" do
      it "should be able to update a board" do
        board = create(:board, user: user)
        put :update, id: board.id, title: "Updated title", share_public: true
        expect(assigns(:board).title).to eql "Updated title"
        expect(assigns(:board).share_public).to eq(true)
        expect(response.status).to eq(200)
      end
    end

    describe "DELETE /boards/:id" do
      it "should be able to destroy a board" do
        # should have at least one board.
        create :board, user: user

        board = create :board, user: user
        delete :destroy, id: board.id
        expect(response.status).to eq(200)
      end

      it "should be able to remove himself as collaborator" do
        shared_board = create :board
        shared_board.push collaborator_ids: user._id
        shared_board.reload
        delete :destroy, id: shared_board.id
        expect(assigns(:board).collaborator_ids).to be_empty
        expect(shared_board.user.boards).to_not be_empty
      end

      it "must have at least one board" do
        create :board, user: user
        board = user.boards.first
        delete :destroy, id: board._id
        expect(response.status).to be(500)
        expect(assigns(:current_user).boards).to_not be_empty
      end
    end
  end
end
