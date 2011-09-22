require 'test_helper'

class StickiesTest < ActionDispatch::IntegrationTest

  context "A logged user" do
    setup do
      require_authentication
      @board = assigns(:board)
      @board.stickies << Factory.build(:sticky)
      @board.save
    end

    should "be able to create a sticky" do
      sticky = Factory.build :sticky, :content => "I traveled to Hawaii"
      assert assigns(:board).stickies.one?
      post "/boards/#{@board.id}/stickies", sticky.attributes.except(:_id)
      assert_equal assigns(:board).stickies.count, 2
      assert_response :success
    end

    should "be able to retrieve stickies" do
      get "/boards/#{@board.id}/stickies"
      assert assigns(:board).stickies.any?
      assert_equal assigns(:board).stickies.to_json, @response.body
      assert_response :success
    end

    should "be able to update a sticky" do
      sticky = @board.stickies.first
      put "/boards/#{@board.id}/stickies/#{sticky.id}", :content => "After Hawaii went to Can Cun"
      assert_equal assigns(:sticky).content, "After Hawaii went to Can Cun"
      assert_equal assigns(:sticky)._id, sticky._id
      assert_response :success
    end

    should "be able to destroy a sticky" do
      sticky = @board.stickies.first
      delete "/boards/#{@board.id}/stickies/#{sticky.id}"
      assert assigns(:board).stickies.empty?
      assert_response :success
    end

    should "not be able to retrieve stickies from other person" do
      board = Factory :board
      assert_raise ActionController::RoutingError do
        get_via_redirect "/boards/#{board.id}/stickies"
      end
    end
  end

end