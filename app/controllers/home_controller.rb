class HomeController < ApplicationController
  def index
    @board = latest_board if signed_in?
  end

  def share
    @board = Board.where(:share_public => true, :secret_token => params[:id]).first || not_found
    @readonly = true
    render :action => "index"
  end

  private

  def latest_board
    if @current_user.latest_open?
      board = Board.where("$or" => [
        { :_id => @current_user.latest_open, :user_id => current_user.id }, 
        { :_id => @current_user.latest_open, :collaborator_ids => { "$in" => [current_user.id] } }
      ]).first
    end

    if board.nil? and @current_user.latest_open?
      @current_user.set({ :latest_open => nil })
      @current_user.reload
    end

    board || @current_user.boards.first
  end
end
