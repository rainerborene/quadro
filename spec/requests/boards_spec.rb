# encoding: utf-8
require 'spec_helper'

describe "Boards" do
  describe "A logged user" do
    before { get_via_redirect "/auth/twitter" }

    describe "GET /boards" do
      it "should be able to retrieve boards" do
        get boards_path
        boards = Board.all :user_id => assigns(:current_user).id
        response.body.should eql boards.to_json
        response.status.should be(200)
      end
    end

    describe "POST /boards" do
      it "should be able to create a board" do
        post boards_path, :title => "Testing Roadmap"
        assigns(:board).should_not be_nil
        assigns(:board).should_not be_new_record
        response.body.should eql assigns(:board).to_json
        response.status.should be(201)
      end
    end

    describe "PUT /boards/:id" do
      it "should be able to update a board" do
        board = assigns(:current_user).boards.first
        put board_path(board.id), { :title => "Updated title", :share_public => true }
        assigns(:board).title.should eql "Updated title"
        assigns(:board).share_public.should be_true
        response.status.should be(200)
      end
    end

    describe "DELETE /boards/:id" do
      it "should be able to destroy a board" do
        board = Factory :board, :user => assigns(:current_user)
        delete board_path(board.id)
        response.status.should be(200)
      end

      it "should be able to remove himself as collaborator" do
        shared_board = Factory :board
        shared_board.push :collaborator_ids => assigns(:current_user)._id
        shared_board.reload
        delete board_path(shared_board.id)
        assigns(:board).should have(0).collaborator_ids
        shared_board.user.should have_at_least(1).boards
      end

      it "must have at least one board" do
        board = assigns(:current_user).boards.first
        delete board_path(board.id)
        response.status.should be(500)
        assigns(:current_user).should have(1).boards
      end
    end
  end
  
  describe "A visitor" do
    subject { Factory :board, :share_public => true }

    describe "GET /share/:id" do
      it "should be able to access a public board" do
        get share_board_path(subject.secret_token)
        assigns(:board).secret_token.should eql subject.secret_token
        assigns(:board).share_public.should be_true
        assigns(:readonly).should be_true
        response.status.should be(200)
        response.should render_template("index")
        response.body.should include("#{assigns(:board).title} • Quadro")
      end
    end
  end
end
