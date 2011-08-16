class HomeController < ApplicationController
  def index
    @board = current_user.boards.first if signed_in?
  end

  def share
    @board = Board.where(:share_public => true, :secret_token => params[:id]).first || not_found
    @readonly = true
    render :action => "index"
  end
end
