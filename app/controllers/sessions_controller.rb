require "twitter_job"

class SessionsController < ApplicationController
  def create
    auth = request.env["omniauth.auth"]
    user = User.find_by_provider_and_uid(auth["provider"], auth["uid"]) || User.new

    if user.new?
      credentials = auth["credentials"]
      message = "Want to save your notes online but don't know where? Check this out http://quadroapp.com"
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
    render :text => "Something went wrong. Why don't you try again?"
  end

  def destroy
    session[:user_id] = nil
    redirect_to root_url
  end
end
