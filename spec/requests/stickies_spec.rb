require 'spec_helper'

describe StickiesController do
  describe "A logged user" do
    before do
      get_via_redirect "/auth/twitter"
      @board = assigns(:board)
      @board.stickies << Factory.build(:sticky)
      @board.save
    end

    it "should be able to create a sticky" do
      sticky = Factory.build :sticky, :content => "I traveled to Hawaii"
      assigns(:board).should have(1).stickies
      post "/boards/#{@board.id}/stickies", sticky.attributes.except(:_id)
      assigns(:board).should have(2).stickies
      response.response_code.should equal 200
    end

    it "should be able to retrieve stickies" do
      get "/boards/#{@board.id}/stickies"
      assigns(:board).stickies.should_not be_empty
      response.body.should eql assigns(:board).stickies.to_json
      response.response_code.should equal 200
    end

    it "should be able to update a sticky" do
      sticky = @board.stickies.first
      put "/boards/#{@board.id}/stickies/#{sticky.id}", :content => "After Hawaii went to Cancun"
      assigns(:sticky).content.should eql("After Hawaii went to Cancun")
      assigns(:sticky)._id.should eql sticky._id
      response.response_code.should equal 200
    end

    it "should be able to destroy a sticky" do
      sticky = @board.stickies.first
      delete "/boards/#{@board.id}/stickies/#{sticky.id}"
      assigns(:board).stickies.should be_empty
      response.response_code.should equal 200
    end

    it "should set latest open attribute of user when retrieving stickies" do
      board = Factory :board, :user => assigns(:current_user)

      get "/boards/#{board.id}/stickies"
      assigns(:current_user).latest_open.should eql board.id
      assigns(:board)._id.should eql board._id
      board.destroy.should be_true

      get "/"
      assigns(:current_user).latest_open.should be_nil
      assigns(:current_user).boards.first.should eql @board
    end

    it "should not be able to retrieve stickies from other person" do
      board = Factory :board

      lambda { 
        get_via_redirect "/boards/#{board.id}/stickies" 
      }.should raise_error(ActionController::RoutingError)
    end
  end
end
