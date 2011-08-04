class BoardsController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_board, :except => [:index, :create]

  def index
    render :json => Board.all(:user_id => current_user.id)
  end

  def create
    board = current_user.boards.create! pick params, :title
    render :json => board
  end

  def update
    @board.update_attributes! pick params, :title, :share_public
    render :json => @board.to_json(:include => {})
  end

  def destroy
    if current_user.boards.one?
      render :json => { :success => false, :message => "You must have at least one board registered." }, :status => 500
    else
      render :json => { :success => @board.destroy }
    end
  end

  private

  def find_board
    @board = Board.where(:id => params[:id], :user_id => current_user.id).first
  end
end
