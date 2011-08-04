class StickiesController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_board

  def index
    render :json => @board.stickies
  end

  def create
    sticky = Sticky.new pick params, :title, :content, :position_x, :position_y
    @board.stickies << sticky
    @board.save
    render :json => sticky
  end

  def update
    sticky = @board.stickies.find(params[:id])

    if sticky.update_attributes! pick params, :title, :content, :position_x, :position_y, :color
      render :json => sticky
    else
      render :json => { :success => false }, :status => 500
    end
  end

  def destroy
    @sticky = @board.stickies.find(params[:id])
    @board.stickies.delete(@sticky)
    @board.save
    render :json => { :success => true }
  end

  private

  def find_board
    @board = Board.where(:id => params[:board_id], :user_id => current_user.id).first
  end
end
