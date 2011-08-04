class Board
  include MongoMapper::Document

  key :title, String, :required => true
  key :share_public, Boolean, :default => false
  key :secret_token, String, :required => true, :default => lambda { Digest::SHA1.hexdigest((Time.now.to_i * rand).to_s).slice(0, 8) }
  key :collaborator_ids, Array
  timestamps!

  many :collaborators, :class_name => "User", :in => :collaborator_ids
  many :stickies

  belongs_to :user

  attr_protected :user_id

  def serializable_hash(options)
    options ||= {}
    super({
      :except => [ :collaborator_ids, :created_at, :updated_at, :stickies ],
      :include => {
        :collaborators => { :except => [ :token, :secret_token, :uid, :provider, :created_at, :updated_at ] }
      }
    }.merge(options))
  end
end

