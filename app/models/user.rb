class User
  include MongoMapper::Document

  key :uid, String, :required => true
  key :provider, String, :required => true, :default => "twitter"
  key :name, String, :required => true
  key :nickname, String, :required => true
  key :profile_image, String, :required => true
  key :token, String
  key :secret_token, String
  timestamps!

  many :boards

  def update_with_omniauth(auth)
    update_attributes!({
      :uid => auth["uid"],
      :provider => auth["provider"],
      :name => auth["user_info"]["name"],
      :nickname => auth["user_info"]["nickname"],
      :profile_image => auth["user_info"]["image"],
      :token => auth["credentials"]["token"],
      :secret_token => auth["credentials"]["secret"]
    })
  end

  def every_boards
    results = Board.all(:collaborator_ids => [_id]) | self.boards
    results.sort_by(&:title)
  end

  def serializable_hash(options={})
    super({ 
      :except => [ :token, :secret_token, :uid, :provider, :created_at, :updated_at ]
    })
  end

end
