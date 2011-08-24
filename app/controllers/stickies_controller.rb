class StickiesController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_board

  def index
    render :json => @board.stickies
  end

  def create
    sticky = Sticky.new picked_attributes
    @board.stickies << sticky
    @board.save
    render :json => sticky
  end

  def update
    sticky = @board.stickies.find(params[:id])

    if sticky and sticky.update_attributes! picked_attributes
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

  def picked_attributes
    pick params, :content, :position_x, :position_y, :color, :z_index
  end
end
