require 'test_helper'

class BoardsTest < ActionDispatch::IntegrationTest

  test "unlogged user has should not have access to anything" do
    post_via_redirect "/boards", :title => "Outlaw Space"
    assert_response :forbidden
  end

  test "logged user should be able to retrieve his boards" do
    as_logged do
      get "/boards"
      boards = Board.all :user_id => assigns(:current_user).id
      assert_equal @response.body, boards.to_json
      assert_response :success
    end
  end

  test "logged user should be able to create a board" do
    as_logged do
      post "/boards", :title => "Testing Roadmap"
      assert_not_nil assigns(:board)
      assert !assigns(:board).new_record?
      assert_equal assigns(:board).to_json, @response.body, "Should return only the JSON format"
      assert_response :created
    end
  end

  test "logged user should be able to update a board" do
    as_logged do
      board = assigns(:current_user).boards.first
      put "/boards/#{board.id}", { :title => "Updated title", :share_public => true }
      assert_equal assigns(:board).title, "Updated title"
      assert assigns(:board).share_public
      assert_response :success
    end
  end

  test "logged user should be able to destroy a board" do
    as_logged do
      board = Factory :board, :user => assigns(:current_user)
      delete "/boards/#{board.id}"
      assert_response :success

      other_board = assigns(:current_user).boards.first
      delete "/boards/#{other_board.id}"
      assert_response :internal_server_error
      assert assigns(:current_user).boards.one?, "User must have at least one board"
    end
  end

end
