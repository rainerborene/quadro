class User
  include MongoMapper::Document

  key :uid, String, :required => true
  key :provider, String, :required => true, :default => "twitter"
  key :name, String, :required => true
  key :nickname, String, :required => true
  key :profile_image, String, :required => true
  key :token, String
  key :secret_token, String
  key :latest_open, ObjectId
  timestamps!

  many :boards, :dependent => :destroy
  many :notifications

  def update_with_omniauth(auth)
    update_attributes!({
      :uid => auth["uid"],
      :provider => auth["provider"],
      :name => auth["user_info"]["name"],
      :nickname => auth["user_info"]["nickname"].downcase,
      :profile_image => auth["user_info"]["image"],
      :token => auth["credentials"]["token"],
      :secret_token => auth["credentials"]["secret"]
    })
  end

  def all_boards
    results = Board.all(:collaborator_ids => [_id]) | self.boards
    results.sort_by(&:title)
  end

  def own?(secret_token)
    Board.where("$or" => [
      { :secret_token => secret_token, :user_id => self.id }, 
      { :secret_token => secret_token, :collaborator_ids => { "$in" => [self.id] } } 
    ]).any?
  end

  def notified?(notification)
    !User.fields("id").first({ :id => id, :notifications => notification }).nil?
  end

  def serializable_hash(options={})
    super({ 
      :except => [ :token, :secret_token, :uid, :provider, :created_at, :updated_at ]
    })
  end
end
