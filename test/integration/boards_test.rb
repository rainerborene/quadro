require 'test_helper'

class BoardsTest < ActionDispatch::IntegrationTest

  context "A logged user" do
    setup { require_authentication }

    should "be able to retrieve his boards" do
      get "/boards"
      boards = Board.all :user_id => assigns(:current_user).id
      assert_equal @response.body, boards.to_json
      assert_response :success
    end

    should "be able to create a board" do
      post "/boards", :title => "Testing Roadmap"
      assert_not_nil assigns(:board)
      assert !assigns(:board).new_record?
      assert_equal assigns(:board).to_json, @response.body, "Response body didn't match"
      assert_response :created
    end

    should "be able to update a board" do
      board = assigns(:current_user).boards.first
      put "/boards/#{board.id}", { :title => "Updated title", :share_public => true }
      assert_equal assigns(:board).title, "Updated title"
      assert assigns(:board).share_public
      assert_response :success
    end

    should "be able to destroy a board" do
      board = Factory :board, :user => assigns(:current_user)
      delete "/boards/#{board.id}"
      assert_response :success

      other_board = assigns(:current_user).boards.first
      delete "/boards/#{other_board.id}"
      assert_response :internal_server_error
      assert assigns(:current_user).boards.one?, "User must have at least one board"
    end

    should "be able to remove himself as collaborator" do
      shared_board = Factory :board
      shared_board.push :collaborator_ids => assigns(:current_user)._id
      shared_board.reload

      delete "/boards/#{shared_board.id}"
      assert shared_board.user.boards.any?, "Boards collection must not be empty"
      assert assigns(:board).collaborator_ids.empty?, "User must not be collaborating"
    end
  end

end
