class Sticky
  include MongoMapper::EmbeddedDocument

  key :content, String, :required => true
  key :position_x, Integer, :required => true
  key :position_y, Integer, :required => true
  key :color, String, :required => true, :default => "yellow"
  key :z_index, Integer, :required => true, :default => 0
  embedded_in :board

  before_create :clear_stickies_count_cache
  before_destroy :clear_stickies_count_cache

  def clear_stickies_count_cache
    board.set({ :stickies_count_cache => nil })
  end

  def self.count
    Board.fields("stickies_count_cache").all.collect(&:stickies_count_cache).sum
  end
end
