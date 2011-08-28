class MessagesController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_board

  def create
    Beaconpush.channel_message("channel_#{@board.secret_token}", {
      :uid => @current_user.uid,
      :message => params[:message]
    })

    render :json => { :success => true }
  end
end
