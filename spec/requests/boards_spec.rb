# encoding: utf-8
require 'spec_helper'

describe BoardsController do
  describe "A logged user" do
    before { get_via_redirect "/auth/twitter" }

    it "should be able to retrieve his boards" do
      get "/boards"
      boards = Board.all :user_id => assigns(:current_user).id
      response.body.should eql boards.to_json
      response.response_code.should equal 200
    end

    it "should be able to create a board" do
      post "/boards", :title => "Testing Roadmap"
      assigns(:board).should_not be_nil
      assigns(:board).should_not be_new_record
      response.body.should eql assigns(:board).to_json
      response.response_code.should equal 201
    end

    it "should be able to update a board" do
      board = assigns(:current_user).boards.first
      put "/boards/#{board.id}", { :title => "Updated title", :share_public => true }
      assigns(:board).title.should eql "Updated title"
      assigns(:board).share_public.should be_true
      response.response_code.should equal 200
    end

    it "should be able to destroy a board" do
      board = Factory :board, :user => assigns(:current_user)
      delete "/boards/#{board.id}"
      response.response_code.should equal 200
    end

    it "must have at least one board" do
      board = assigns(:current_user).boards.first
      delete "/boards/#{board.id}"
      response.response_code.should equal 500
      assigns(:current_user).should have(1).boards
    end

    it "should be able to remove himself as collaborator" do
      shared_board = Factory :board
      shared_board.push :collaborator_ids => assigns(:current_user)._id
      shared_board.reload

      delete "/boards/#{shared_board.id}"
      shared_board.user.should have_at_least(1).boards
      assigns(:board).should have(0).collaborator_ids
    end
  end
  
  describe "A visitor" do
    subject { Factory :board, :share_public => true }

    it "should be able to access a shared board" do
      get "/share/#{subject.secret_token}"
      board = assigns(:board)
      assigns(:board).should_not be_nil
      assigns(:board).share_public.should be_true
      assigns(:readonly).should be_true
      response.response_code.should equal 200
      # response.should have_selector("title", :content => "#{board.title} • Quadro")
    end
  end
end
