class TweetingJob < Struct.new(:message, :token, :secret)
  def perform
    twitter = Twitter::Client.new({ :oauth_token => token, :oauth_token_secret => secret })
    twitter.update(message)
  end
end

class DirectMessageJob < Struct.new(:message, :uid, :token, :secret)
  def perform
    twitter = Twitter::Client.new({ :oauth_token => token, :oauth_token_secret => secret })
    twitter.direct_message_create(uid.to_i, message)
  end
end
