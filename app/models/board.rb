class Board
  include MongoMapper::Document

  key :title, String, :required => true
  key :share_public, Boolean, :default => false
  key :secret_token, String, :required => true, :default => lambda { Digest::SHA1.hexdigest((Time.now.to_i * rand).to_s).slice(0, 8) }
  key :collaborator_ids, Array
  key :stickies_count_cache, Integer
  timestamps!

  many :collaborators, :class_name => "User", :in => :collaborator_ids
  many :stickies

  belongs_to :user
  attr_protected :user_id

  def stickies_count
    if send(:stickies_count_cache).nil?
      set({ :stickies_count_cache => stickies.count })
      reload
    end

    send(:stickies_count_cache)
  end

  def serializable_hash(options)
    options ||= {}
    super({
      :except => [ :collaborator_ids, :created_at, :updated_at, :stickies, :user_id, :stickies_count_cache ],
      :include => {
        :user => { :only => [ :id, :name, :profile_image, :nickname ] },
        :collaborators => { :except => [ :token, :secret_token, :uid, :provider, :created_at, :updated_at ] }
      }
    }.merge(options))
  end
end

