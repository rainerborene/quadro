class HomeController < ApplicationController
  def index
    if params[:id]
      @board = Board.where(:share_public => true, :secret_token => params[:id]).first
      @readonly = true
    else
      @board = current_user.boards.first if signed_in?
    end
  end
end
