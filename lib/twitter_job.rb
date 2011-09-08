class TweetingJob < Struct.new(:message, :token, :secret)
  def perform
    twitter = Twitter::Client.new({ :oauth_token => token, :oauth_token_secret => secret })
    twitter.update(message)
  end
end

class DirectMessageJob < Struct.new(:message, :user_id)
  def perform
    Twitter.direct_message_create(user_id.to_i, message)
  end
end
