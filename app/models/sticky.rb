class Sticky
  include MongoMapper::EmbeddedDocument

  key :content, String, :required => true
  key :position_x, Integer, :required => true
  key :position_y, Integer, :required => true
  key :color, String, :required => true, :default => "yellow"
  key :z_index, Integer, :required => true, :default => 0
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
end
