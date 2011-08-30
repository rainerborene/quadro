class PusherController < ApplicationController
  protect_from_forgery :except => :auth

  def auth
    secret_token = params[:channel_name].gsub("presence-", "")

    if current_user and current_user.own? secret_token
      auth = Pusher[params[:channel_name]].authenticate(params[:socket_id], {
        :user_id => current_user.id.to_s,
        :user_info => {
          :name => current_user.name,
          :profile_image => current_user.profile_image
        }
      })
    else
      render :json => { :success => false, :message => "Not authorized" }, :status => 403
    end

    render :json => auth
  end
end
