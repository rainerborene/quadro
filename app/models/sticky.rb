class Sticky
  include MongoMapper::EmbeddedDocument

  key :title, String, :required => true
  key :content, String, :required => true
  key :position_x, Integer, :required => true
  key :position_y, Integer, :required => true
  key :color, String, :required => true, :default => "yellow"
  embedded_in :board

  def self.count
    Rails.cache.fetch(:stickies, :expires_in => 1.hour) do
      count = 0
      Board.fields("stickies").all.each do |item|
        count += item.stickies.length
      end
      count
    end
  end

  def self.all(board_id)
    Board.fields("stickies").all.map { |b| b.stickies }.flatten
  end
end
