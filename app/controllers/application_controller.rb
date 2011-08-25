class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :configure_twitter
  helper_method :signed_in?, :current_user, :pick

  def signed_in?
    !session[:user_id].nil?
  end
  
  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end

  def authenticate_user!
    unless signed_in?
      render(:json => { :error => "Access denied." }, :status => 403) unless signed_in?
      false
    end
  end

  def pick(hash, *keys)
    filtered = {}
    hash.each do |key, value| 
      filtered[key.to_sym] = value if keys.include?(key.to_sym) 
    end
    filtered
  end

  def configure_twitter
    if signed_in?
      Twitter.configure do |config|
        config.oauth_token = current_user.token
        config.oauth_token_secret = current_user.secret_token
      end
    end
  end

  def not_found
    raise ActionController::RoutingError.new('Not Found')
  end

  def find_board
    @board = Board.where("$or" => [
      { :_id => BSON::ObjectId(params[:board_id] || params[:id]), :user_id => current_user.id }, 
      { :_id => BSON::ObjectId(params[:board_id] || params[:id]), :collaborator_ids => { "$in" => [current_user.id] } } ]).first

    not_found if @board.nil?
  end
end
