class CollaboratorsController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_board

  def create
    username = params["username"].downcase
    user = User.where(:nickname => username).first

    if user.nil?
      begin
        twitter_user = Twitter.users(username).first 

        user = User.create!({
          :uid => twitter_user.id,
          :name => twitter_user.name,
          :nickname => twitter_user.screen_name.downcase,
          :profile_image => twitter_user.profile_image_url
        })
      rescue Twitter::NotFound => ex
        return render :json => { :message => "No user matches for specified terms" }, :status => 404
      end
    end

    @board.collaborators << user
    @board.save
    render :json => user
  end

  def destroy
   @board.collaborator_ids.delete_if { |i| i.to_s.eql? params[:id] }
   render :json => { :success => @board.save }
  end
end
