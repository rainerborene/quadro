require 'spec_helper'

describe "Stickies" do
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
      post board_stickies_path(@board.id), sticky.attributes.except(:_id)
      assigns(:board).should have(2).stickies
      response.status.should be(200)
    end

    it "should be able to retrieve stickies" do
      get board_stickies_path(@board.id)
      assigns(:board).stickies.should_not be_empty
      response.body.should eql assigns(:board).stickies.to_json
      response.status.should be(200)
    end

    it "should be able to update a sticky" do
      sticky = @board.stickies.first
      put board_sticky_path(:board_id => @board.id, :id => sticky.id), :content => "After Hawaii went to Cancun"
      assigns(:sticky).content.should eql("After Hawaii went to Cancun")
      assigns(:sticky)._id.should eql sticky._id
      response.status.should be(200)
    end

    it "should be able to destroy a sticky" do
      sticky = @board.stickies.first
      delete board_sticky_path(:board_id => @board.id, :id => sticky.id)
      assigns(:board).stickies.should be_empty
      response.status.should be(200)
    end

    it "should set latest open attribute of user when retrieving stickies" do
      board = Factory :board, :user => assigns(:current_user)

      get board_stickies_path(board.id)
      assigns(:current_user).latest_open.should eql board.id
      assigns(:board)._id.should eql board._id
      board.destroy.should be_true

      get root_path
      assigns(:current_user).latest_open.should be_nil
      assigns(:current_user).boards.first.should eql @board
    end

    it "should not be able to view stickies from other person" do
      board = Factory :board

      lambda { get board_stickies_path(board.id) }.should raise_error
    end
  end
end
