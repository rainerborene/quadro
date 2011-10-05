class CollaboratorsController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_board

  def create
    username = params["username"].downcase
    @user = User.where(:nickname => username).first

    if @user.nil?
      begin
        twitter_user = Twitter.users(username).first 

        @user = User.create!({
          :uid => twitter_user.id,
          :name => twitter_user.name,
          :nickname => twitter_user.screen_name.downcase,
          :profile_image => twitter_user.profile_image_url
        })
      rescue Twitter::NotFound => ex
        return render :json => { :message => "No user matches for specified terms" }, :status => :not_found
      end
    end

    if @board.collaborator_ids.find { |c| c.eql? @user.id }
      return render :json => { :success => false }, :status => :unprocessable_entity
    end

    notification = { 
      :receiver => @user._id,
      :resource => @board._id,
      :action => :collaboration }

    if ENV["SOCIAL_MESSENGER"] and not current_user.notified? notification
      message = "I've just shared some notes with you on @quadroapp. Go to http://quadroapp.com and sign in."
      Delayed::Job.enqueue DirectMessageJob.new(message, @user.uid, current_user.token, current_user.secret_token)
    end

    current_user.notifications.create(notification) unless current_user.notified? notification

    @board.push(:collaborator_ids => @user._id)
    @board.reload
    render :json => @user, :status => :created
  end

  def destroy
    @board.pull(:collaborator_ids => BSON::ObjectId(params[:id]) )
    @board.reload
    render :json => { :success => true }
  end
end
