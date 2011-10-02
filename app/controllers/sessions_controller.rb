class SessionsController < ApplicationController
  def create
    auth = request.env["omniauth.auth"]
    user = User.find_by_provider_and_uid(auth["provider"], auth["uid"]) || User.new

    if user.new? and ENV["SOCIAL_MESSENGER"] == "yes"
      credentials = auth["credentials"]
      message = "I'm using @quadroapp to store post-its on the cloud."
      Delayed::Job.enqueue TweetingJob.new(message, credentials["token"], credentials["secret"])
    end

    user.update_with_omniauth(auth)
    session[:user_id] = user.id.to_s

    if user.boards.empty?
      user.boards.create!(:title => "Untitled")
      user.save
    end

    redirect_to root_url
  end

  def failure
    render :text => "Something went wrong. Why don't you try again?", :status => :bad_request
  end

  def destroy
    session[:user_id] = nil
    redirect_to root_url
  end
end
